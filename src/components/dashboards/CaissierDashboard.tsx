import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Header from '../Header';
import ProfilePage from '../ProfilePage';
import { Badge, onlineBadgeClass, onlineBadgeInline } from '../ui/badge';
import CaissierSidebar from './CaissierSidebar';
import useTableZoom from '../../hooks/useTableZoom';
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import { useTranslation } from '../../hooks/useTranslation';
import PaymentReceiptsTable from './PaymentReceiptsTable';
import DeclarationsTable from './DeclarationsTable';
import { useAuth } from '../../contexts/AuthContext';
import { PaymentReceipt } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import CreatePaymentDialog from '../CreatePaymentDialog';
import EditPaymentDialog from '../EditPaymentDialog';
// import ChauffeurPaymentDialog from '../ChauffeurPaymentDialog'; // Uncomment if used
import ValidatePaymentDialog from '../ValidatePaymentDialog';
import EditDeclarationDialog from '../EditDeclarationDialog';
import { Button } from '../ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '../ui/alert-dialog';
import SearchAndFilter from '../SearchAndFilter';
import { getTranslation } from '../../lib/translations';
import { Plus } from 'lucide-react';
import SendReceiptsDialog from './SendReceiptsDialog';
import CreateRecouvrementDialog from '../CreateRecouvrementDialog';
import CaissierStats from './CaissierStats';

const CaissierDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile'>('dashboard');
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const { badgeClass, badgeStyle, localFontSize } = useTableZoom();
  const { isOnline } = useOnlineStatus();
  const { t, settings } = useTranslation();
  const isMobile = settings?.viewMode === 'mobile';
  // Position badges according to language direction (RTL for Arabic)
  const badgePosStyle: React.CSSProperties = settings?.language === 'ar'
    ? { position: 'absolute', top: 8, left: 8 }
    : { position: 'absolute', top: 8, right: 8 };
  // Track how the user navigated to a section so we can decide whether to reset filters
  const [lastNavSource, setLastNavSource] = React.useState<'none'|'nav'|'indicator'>('none');
  // Prefer hook t() so current language (including Arabic) is respected
  const addLabel = t('planificateur.add') || t('buttons.add');
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    try {
      console.log('[CaissierDashboard] settings.language=', settings.language, 'addLabel=', addLabel);
    } catch (e) {
      // ignore
    }
  }
  const tabOrder: Array<'dashboard' | 'paiement' | 'tracage' | 'profile'> = ['dashboard', 'paiement', 'tracage', 'profile'];

  // Connexion dynamique Firestore
  const { declarations } = useSharedData();
  const auth = useAuth();
  const isExternalCaissier = !!(auth.user && auth.user.role === 'caissier' && auth.user.employeeType === 'externe');
  // Payments collection listener (use payments as the source of truth)
  const [payments, setPayments] = React.useState<PaymentReceipt[]>([]);
  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { listenPayments, filterPaymentsForUser } = await import('../../services/paymentService');
      unsub = listenPayments((items: any[]) => {
        // filter payments according to current user (external caissier sees only company payments)
        const visible = filterPaymentsForUser(items || [], auth.user);
        setPayments(visible as PaymentReceipt[]);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);
  const isExternal = auth.user?.employeeType === 'externe';

  // Prefer payments listener as the source of truth; fallback to embedded receipts from declarations
  // receipts should reflect payments visible to the user; if listener has data use it,
  // otherwise fallback to embedded receipts on declarations but filtered by company when needed
  const receiptsFromDeclsAll = declarations.flatMap(d => d.paymentReceipts || []);
  // If user is external cashier/chauffeur, restrict embedded receipts to their company
  const receiptsFromDecls = (auth.user && (auth.user.role === 'caissier' || auth.user.role === 'chauffeur') && auth.user.employeeType === 'externe')
    ? (receiptsFromDeclsAll || []).filter(r => String(r.companyId || '') === String(auth.user?.companyId))
    : receiptsFromDeclsAll;
  const receipts = (payments && payments.length > 0) ? payments : receiptsFromDecls;

  // Recent recouvrements (payments) for dashboard widget — sorted by createdAt desc, limit 5
  const recentRecouvrements = React.useMemo(() => {
    const source = (payments && payments.length > 0) ? payments : (receipts || []);
    try {
      return [...source].sort((a, b) => {
        const ta = a && a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const tb = b && b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return tb - ta;
      }).slice(0, 5);
    } catch (e) {
      return (source || []).slice(0, 5);
    }
  }, [payments, receipts]);

  // Dashboard stats for cashier (robust checks)
  // Recouvrements: count declarations that have receipts but are NOT marked recouvré
  const recouvrementsCount = (declarations || []).filter(d => {
    const hasPayments = Array.isArray((d as any).paymentReceipts) && (d as any).paymentReceipts.length > 0
      || (payments || []).some(p => String(p.declarationId || '') === String(d.id));
    if (!hasPayments) return false;
    const paymentState = String((d as any).paymentState || '').toLowerCase();
    const isRecouvre = paymentState.startsWith('recouvr'); // covers recouvre/recouvré/etc.
    return !isRecouvre;
  }).length;

  // Payments not validated: consider multiple normalization variants for status
  const paymentsNotValidatedCount = (receipts || []).filter(r => {
    const s = String(r.status || '').toLowerCase();
    return !['validee', 'validated', 'valid', 'valide'].includes(s);
  }).length;

  // Payments without company: no companyId and no companyName (empty/whitespace)
  const paymentsNoCompanyCount = (receipts || []).filter(r => {
    const hasCompanyId = !!(r.companyId);
    const hasCompanyName = !!(r.companyName && String(r.companyName).trim().length > 0);
    return !hasCompanyId && !hasCompanyName;
  }).length;
  const [paymentInitialFilter, setPaymentInitialFilter] = React.useState<'all'|'brouillon'|'validee'>('all');
  // allow forcing company filter when navigating from stats (e.g. paiements sans société)
  const [paymentInitialCompanyFilter, setPaymentInitialCompanyFilter] = React.useState<'all'|'no-company'>('all');
  // reset counter to signal child tables to reapply initial filters when we want a hard reset
  const [paymentsTableResetKey, setPaymentsTableResetKey] = React.useState(0);

  const [consultReceipt, setConsultReceipt] = React.useState<PaymentReceipt | null>(null);
  const [editReceipt, setEditReceipt] = React.useState<PaymentReceipt | null>(null);
  const [validateReceipt, setValidateReceipt] = React.useState<PaymentReceipt | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = React.useState<string | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [receiptToDelete, setReceiptToDelete] = React.useState<string | null>(null);
  // State to consult a declaration (read-only dialog)
  const [consultDeclaration, setConsultDeclaration] = React.useState<any | null>(null);
  const [sendReceiptsFor, setSendReceiptsFor] = React.useState<any | null>(null);
  const [showCreateRecouvrement, setShowCreateRecouvrement] = React.useState(false);
  // Local search/filter state for the recouvrement declarations view (matches Chauffeur layout)
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');

  // Reset filters when navigation comes from the sidebar (nav). Indicator-driven navigation
  // sets lastNavSource('indicator') and should preserve the filters passed from the dashboard.
  React.useEffect(() => {
    if (lastNavSource !== 'nav') return;

    try {
      if (activeTab === 'recouvrement') {
        // reset recouvrement view filters
        setSearchTerm('');
        setStatusFilter('all');
        setPaymentInitialFilter('all');
        setPaymentInitialCompanyFilter('all');
      }

      if (activeTab === 'paiement') {
        // reset payments initial filters
        setPaymentInitialFilter('all');
        setPaymentInitialCompanyFilter('all');
        // signal payments table to reapply initial filters
        setPaymentsTableResetKey(k => k + 1);
      }
    } finally {
      // consume the nav source so reset only happens once per navigation
      setLastNavSource('none');
    }
  }, [lastNavSource, activeTab]);

  const handleDeleteReceipt = async (id: string, skipConfirmation = false) => {
    // If caller already confirmed (skipConfirmation), perform deletion. Otherwise open confirmation dialog.
    if (!skipConfirmation) {
      setReceiptToDelete(id);
      setDeleteDialogOpen(true);
      return;
    }
    // find receipt
    const receipt = payments.find(p => p.id === id);
    if (!receipt) return;
    const status = String(receipt.status || '').toLowerCase();
    if (['validee', 'validated', 'valide', 'valid'].includes(status)) {
      alert(t('forms.cannotDeleteValidated') || "Impossible de supprimer un reçu validé");
      return;
    }
    if (auth.user?.role === 'planificateur') {
      alert(t('forms.unauthorized') || 'Non autorisé');
      return;
    }
    try {
      const { safeDeletePayment } = await import('../../services/paymentService');
      await safeDeletePayment(id, auth.user);
    } catch (e: any) {
      alert((e && e.message) || t('forms.deleteFailed') || 'Suppression échouée');
    }
  };

  // Gestion du profil (mobile et desktop)
  if (activeTab === 'profile') {
    if (isMobile) {
      return (
        <div className="max-w-[430px] mx-auto bg-background min-h-screen flex flex-col">
          <ProfilePage onBack={() => setActiveTab('dashboard')} />
        </div>
      );
    }
    return (
      <div>
        <Header onProfileClick={() => setActiveTab('dashboard')} />
        <div className="p-6">
          <ProfilePage onBack={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'min-h-screen bg-background w-full overflow-x-hidden'}>
      <Header onProfileClick={() => setActiveTab('profile')} />
      {/* Badge en ligne : mobile affiché sous le Header, desktop positionné en absolute dans le conteneur principal (évite bande/floating) */}
      {isMobile && (
        <div
          className={`flex px-2 pt-3 mb-2 items-center gap-2 ${settings.language === 'ar' ? 'justify-start flex-row-reverse' : ''}`}
        >
          <Badge
            style={{ ...badgeStyle, ...onlineBadgeInline }}
            className={`${badgeClass} items-center gap-2 font-semibold ${onlineBadgeClass} shadow`}
            title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {isOnline ? t('dashboard.online') : t('dashboard.offline')}
          </Badge>
        </div>
      )}
      {/* Layout desktop : sidebar à gauche, main à droite, padding et scroll identiques chauffeur/planificateur */}
      <div className={isMobile ? 'flex flex-col flex-1' : 'flex min-h-[calc(100vh-4rem)] relative'}>
        {/* Badge en desktop: placé en absolute dans le conteneur relatif pour éviter tout impact sur le flux */}
        {!isMobile && (
          <div className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10`}>
            <Badge size="md" style={{ ...badgeStyle, ...onlineBadgeInline }} className={`${badgeClass} items-center gap-2 font-semibold ${onlineBadgeClass} shadow`} title={isOnline ? t('dashboard.online') : t('dashboard.offline')}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </Badge>
          </div>
        )}
        <CaissierSidebar
          activeTab={activeTab}
          onTabChange={tab => { setLastNavSource('nav'); setActiveTab(tab as 'dashboard' | 'paiement' | 'tracage' | 'profile'); }}
        />
        <main className={`flex-1 min-w-0 p-6 ${isMobile ? 'pt-3' : 'pt-16'} overflow-auto`}>
          {/* Affichage façade selon la tab sélectionnée */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* Section title outside Cards, translated */}
              <div className="w-full p-2 pt-1">
                <h2 className="text-2xl font-bold mb-2">{t('caissier.dashboardTitle') || 'Tableau de bord - Caissier'}</h2>
                <div className={isMobile ? "flex flex-col gap-2" : "flex flex-row gap-4"}>
                  {/* Card 1: Recouvrements en attente (sized like Planificateur summary) */}
                  <div className="mb-4 w-full max-w-xl">
                    <Card className="mb-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">{t('caissier.recouvrementsTitle') || 'Recouvrements en attente'}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CaissierStats
                          stats={{ recouvrements: recouvrementsCount, paymentsPending: 0, paymentsNoCompany: 0 }}
                          showRecouvrements={true}
                          showPaymentsPending={false}
                          showPaymentsNoCompany={false}
                          statusLabels={{ recouvrements: t('declarations.notRecovered') || 'Non Recouvré' }}
                          onRecouvrementsClick={() => { setLastNavSource('indicator'); setStatusFilter('non_recouvre'); setPaymentInitialFilter('all'); setPaymentInitialCompanyFilter('all'); setActiveTab('recouvrement'); }}
                          onPaymentsPendingClick={() => { setLastNavSource('indicator'); setPaymentInitialFilter('brouillon'); setPaymentInitialCompanyFilter('all'); setActiveTab('paiement'); }}
                          onPaymentsNoCompanyClick={() => { setLastNavSource('indicator'); setPaymentInitialFilter('all'); setPaymentInitialCompanyFilter('no-company'); setActiveTab('paiement'); }}
                        />
                      </CardContent>
                    </Card>
                  </div>

                  {/* Card 2: Paiements non validés & Paiements sans société (sized like Planificateur summary) */}
                  <div className="mb-4 w-full max-w-xl">
                    <Card className="mb-2">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg font-semibold">{t('caissier.paymentsStatsTitle') || 'Résumé des paiements'}</CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CaissierStats
                          stats={{ recouvrements: 0, paymentsPending: paymentsNotValidatedCount, paymentsNoCompany: paymentsNoCompanyCount }}
                          showRecouvrements={false}
                          showPaymentsPending={true}
                          showPaymentsNoCompany={!isExternalCaissier}
                          statusLabels={{ paymentsPending: t('dashboard.pending') || 'en attente', paymentsNoCompany: t('caissier.paymentsNoCompanyTitle') || 'sans société' }}
                          onRecouvrementsClick={() => {}}
                          onPaymentsPendingClick={() => { setPaymentInitialFilter('brouillon'); setPaymentInitialCompanyFilter('all'); setActiveTab('paiement'); }}
                          onPaymentsNoCompanyClick={() => { setPaymentInitialFilter('all'); setPaymentInitialCompanyFilter('no-company'); setActiveTab('paiement'); }}
                        />
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </div>

              {/* Recouvrements récents: replicate Planificateur 'Déclarations récentes' widget but for payments */}
              <div className="w-full p-2">
                <Card className="bg-card border-border w-full">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg font-semibold">{getTranslation('caissier.recentRecouvrements', settings?.language || 'en') || 'Recent collections'}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {(recentRecouvrements || []).map((p) => {
                        const decl = (declarations || []).find(d => String(d.id) === String(p.declarationId));
                        const title = p.programReference || decl?.number || p.declarationId || (p.companyName || '');
                        const subtitle = decl ? `${decl.chauffeurName || ''} - ${decl.month || ''}/${decl.year || ''}` : (p.chauffeurName || p.companyName || '');
                        const declPaymentState = decl ? String((decl as any).paymentState || '').toLowerCase() : '';
                        const isRecouvre = declPaymentState.startsWith('recouv') || ['validee','validated','valide','valid'].includes(String(p.status || '').toLowerCase());
                        return (
                          <div key={p.id} className="relative flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => setConsultReceipt && setConsultReceipt(p)}>
                            <div>
                              <div className="font-medium">{title}</div>
                              <div className="text-sm text-gray-500">{subtitle}</div>
                            </div>
                            <div style={badgePosStyle}>
                              {isRecouvre ? (
                                <Badge style={{ ...badgeStyle }} className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${badgeClass} px-[10px]`}>
                                  {t('declarations.recovered') || 'Recouvré'}
                                </Badge>
                              ) : (
                                <Badge style={{ ...badgeStyle }} className={`bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200 ${badgeClass} px-[10px]`}>
                                  {t('declarations.notRecovered') || 'Non Recouvré'}
                                </Badge>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
          {activeTab === 'recouvrement' && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{t('caissier.recouvrementTitle') || 'Gestion des Recouvrements'}</h2>
                <div className="flex items-center gap-2">
                  {/* External cashiers: simply hide the create button */}
                  {!isExternalCaissier && (
                    <Button onClick={() => setShowCreateRecouvrement(true)} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {addLabel}
                    </Button>
                  )}
                </div>
              </div>
              <div className="space-y-4">
                <SearchAndFilter
                   searchValue={searchTerm}
                   onSearchChange={setSearchTerm}
                   filterValue={statusFilter}
                   onFilterChange={setStatusFilter}
                  // Filter should reflect recouvrement state (based on payments), not declaration status
                  // Note: SearchAndFilter injects the default 'all' option, so do NOT include it here to avoid duplication
                  filterOptions={[
                    { value: 'recouvre', label: t('declarations.recovered') || 'Recouvré' },
                    { value: 'non_recouvre', label: t('declarations.notRecovered') || 'Non Recouvré' }
                  ]}
                  searchPlaceholder={t('declarations.searchPlaceholder')}
                  filterPlaceholder={t('declarations.filterPlaceholder')}
                  searchColumn="number"
                  onSearchColumnChange={() => {}}
                  searchColumnOptions={[
                    { value: 'number', label: t('declarations.number') },
                    { value: 'notes', label: t('declarations.notes') },
                    { value: 'chauffeurName', label: t('declarations.chauffeurName') }
                  ]}
                />
                  {(() => {
                  const declIdsWithPayments = new Set<string>();
                  try {
                    for (const p of payments) {
                      if (p.declarationId) declIdsWithPayments.add(p.declarationId);
                    }
                  } catch (e) {
                    // ignore
                  }
                  const receiptsFiltered = (declarations || []).filter(d => {
                    // If we have live payments for declarations, use that
                    if (declIdsWithPayments.has(d.id)) return true;
                    // Otherwise, consider embedded paymentReceipts on the declaration
                    if (Array.isArray((d as any).paymentReceipts) && (d as any).paymentReceipts.length > 0) {
                      // If user is external, only include declaration when at least one embedded receipt
                      // belongs to the user's company
                      if (auth.user && (auth.user.role === 'caissier' || auth.user.role === 'chauffeur') && auth.user.employeeType === 'externe') {
                        const hasMatch = (d as any).paymentReceipts.some((pr: any) => String(pr.companyId || '') === String(auth.user?.companyId));
                        return !!hasMatch;
                      }
                      return true;
                    }
                    return false;
                  });

                  // Apply search and status filters similarly to ChauffeurDashboard
                  const finalFiltered = receiptsFiltered.filter(d => {
                    const lowerSearch = (searchTerm || '').toLowerCase();
                    const matchesSearch = !lowerSearch ||
                      String(d.number || '').toLowerCase().includes(lowerSearch) ||
                      String(d.notes || '').toLowerCase().includes(lowerSearch) ||
                      String(d.chauffeurName || '').toLowerCase().includes(lowerSearch);
                    // Interpret statusFilter as recouvrement filter based on paymentState on declaration
                    const paymentState = String((d as any).paymentState || '').toLowerCase();
                    let matchesStatus = true;
                    // Use startsWith to be robust to accents/variants (recouvre, recouvré, recouvr...) 
                    const isRecouvre = paymentState.startsWith('recouvr');
                    if (statusFilter === 'recouvre') matchesStatus = isRecouvre;
                    else if (statusFilter === 'non_recouvre') matchesStatus = !isRecouvre;
                     return matchesSearch && matchesStatus;
                   });

                    return finalFiltered.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                      {(searchTerm || statusFilter !== 'all') ? t('declarations.noDeclarationsWithFilters') : t('declarations.noDeclarations')}
                    </div>
                  ) : (
                    <div className="w-full overflow-x-auto">
          <div className="rounded-md border border-border bg-card min-w-full">
          <DeclarationsTable
          declarations={finalFiltered}
          onValidateDeclaration={(id) => console.log('validate declaration', id)}
          onRejectDeclaration={(id) => console.log('reject declaration', id)}
          onConsultDeclaration={(declaration) => setConsultDeclaration(declaration)}
          onSendReceipts={(declaration) => setSendReceiptsFor(declaration)}
          mobile={isMobile}
          fontSize={isMobile ? '60' : localFontSize}
           // pass payments so the table can compute recouvrement totals
           payments={payments}
           hideStatusColumn={isExternalCaissier}
           hideValidatedColumn={isExternalCaissier}
           hideSendButton={isExternalCaissier}
            />
          </div>
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
          {/* Envoyer dialog: choose receipts related to a declaration and send */}
          {/* We'll show a SendReceiptsDialog when sending */}
          {/* SendReceiptsDialog: only open for internal cashiers */}
          {!isExternalCaissier && (
            <SendReceiptsDialog
              receipts={(() => {
                if (!sendReceiptsFor) return [];
                // prefer global payments listener
                const declId = sendReceiptsFor.id;
                const related = payments.filter(p => String(p.declarationId || '') === String(declId) || (p.programReference && sendReceiptsFor && (`DCP/${sendReceiptsFor.year}/${sendReceiptsFor.month}/${sendReceiptsFor.programNumber}`) === p.programReference));
                if (related.length > 0) return related;
                // fallback to embedded receipts in declaration
                return Array.isArray((sendReceiptsFor as any).paymentReceipts) ? (sendReceiptsFor as any).paymentReceipts : [];
              })()}
              isOpen={!!sendReceiptsFor}
              declarationReference={sendReceiptsFor ? (sendReceiptsFor.programReference || sendReceiptsFor.number) : undefined}
              declarationId={sendReceiptsFor ? sendReceiptsFor.id : undefined}
              onClose={() => setSendReceiptsFor(null)}
              onDeleteReceipt={(id) => handleDeleteReceipt(id)}
              onValidateReceipt={(r) => setValidateReceipt(r)}
              onOpenPreview={(url) => setPreviewPhotoUrl(url)}
            />
          )}
          <CreateRecouvrementDialog isOpen={showCreateRecouvrement} onClose={() => setShowCreateRecouvrement(false)} />
          {/* Declaration consult dialog (read-only) */}
          <EditDeclarationDialog declaration={consultDeclaration} isOpen={!!consultDeclaration} onClose={() => setConsultDeclaration(null)} readOnly={true} />
          {previewPhotoUrl && createPortal(
            <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 pointer-events-auto" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewPhotoUrl(null); }} onPointerDownCapture={(e) => e.stopPropagation()} onMouseDownCapture={(e) => e.stopPropagation()}>
              <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-2 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img src={previewPhotoUrl} alt="Aperçu reçu" className="max-w-[90vw] max-h-[80vh] rounded-lg" />
                <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewPhotoUrl(null); }}>Fermer</button>
              </div>
            </div>,
            document.body
          )}
          {activeTab === 'paiement' && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{t('caissier.paymentsTitle') || 'Gestion des paiements'}</h2>
                {/* placeholder for actions (export, add, etc.) if needed in future */}
                <div className="flex items-center gap-2">
                    {/* External cashiers cannot add payments */}
                    {!isExternalCaissier ? (
                      <Button onClick={() => setShowCreatePayment(true)} className="flex items-center gap-2">
                        <Plus className="h-4 w-4" />
                        {t('planificateur.add')}
                      </Button>
                    ) : null}
                </div>
              </div>
              <div className={(isMobile ? 'overflow-x-auto ' : '') + 'mb-2'}>
                <PaymentReceiptsTable
                  receipts={receipts}
                  onConsultReceipt={(r) => setConsultReceipt(r)}
                  {...( !isExternalCaissier ? { onDeleteReceipt: handleDeleteReceipt, onValidateReceipt: (r) => setValidateReceipt(r) } : {} )}
                  initialStatusFilter={paymentInitialFilter}
                  initialCompanyFilter={paymentInitialCompanyFilter}
                  resetKey={paymentsTableResetKey}
                  fontSize={isMobile ? '60' : localFontSize}
                  mobile={isMobile}
                  hideEditButton={isExternalCaissier}
                />
              </div>
              <EditPaymentDialog receipt={consultReceipt} isOpen={!!consultReceipt} onClose={() => setConsultReceipt(null)} readOnly={true} />
              <EditPaymentDialog receipt={editReceipt} isOpen={!!editReceipt} onClose={() => setEditReceipt(null)} onSave={(updated) => { /* parent can refresh or handle */ setEditReceipt(null); }} />
              <ValidatePaymentDialog receipt={validateReceipt} isOpen={!!validateReceipt} onClose={() => setValidateReceipt(null)} onValidated={(updated) => {
                // parent can refresh or update local state; we rely on the payments listener to update
                setValidateReceipt(null);
              }} />
              <CreatePaymentDialog isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} />
              {/* Delete confirmation dialog (for payments) */}
              <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setReceiptToDelete(null); }}>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>{t('payments.confirmDeleteTitle') || 'Supprimer le reçu'}</AlertDialogTitle>
                    <AlertDialogDescription>{t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'}</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel className="border-0" onClick={() => { setDeleteDialogOpen(false); setReceiptToDelete(null); }}>{t('forms.cancel') || 'Annuler'}</AlertDialogCancel>
                    <AlertDialogAction onClick={async () => {
                      if (receiptToDelete) {
                        try {
                          await handleDeleteReceipt(receiptToDelete, true);
                        } catch (e) {
                          console.error('Delete failed', e);
                        }
                      }
                      setDeleteDialogOpen(false);
                      setReceiptToDelete(null);
                    }}>{t('forms.confirm') || 'Supprimer'}</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
          {activeTab === 'tracage' && (
            <div className="text-muted-foreground">Section Tracage (façade, aucun contenu)</div>
          )}
          {/* Le profil est géré par le bloc conditionnel principal, donc pas besoin ici */}
        </main>
      </div>
    </div>
  );
};

export default CaissierDashboard;
