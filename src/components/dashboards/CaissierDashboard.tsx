import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import Header from '../Header';
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
  // Payments collection listener (use payments as the source of truth)
  const [payments, setPayments] = React.useState<PaymentReceipt[]>([]);
  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { listenPayments } = await import('../../services/paymentService');
      unsub = listenPayments((items: any[]) => {
        // Ensure items are of PaymentReceipt shape
        setPayments(items as PaymentReceipt[]);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, []);
  // Prefer payments listener as the source of truth; fallback to embedded receipts from declarations
  const receipts = (payments && payments.length > 0) ? payments : declarations.flatMap(d => d.paymentReceipts || []);

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

  const [consultReceipt, setConsultReceipt] = React.useState<PaymentReceipt | null>(null);
  const [editReceipt, setEditReceipt] = React.useState<PaymentReceipt | null>(null);
  const [validateReceipt, setValidateReceipt] = React.useState<PaymentReceipt | null>(null);
  const [previewPhotoUrl, setPreviewPhotoUrl] = React.useState<string | null>(null);
  // State to consult a declaration (read-only dialog)
  const [consultDeclaration, setConsultDeclaration] = React.useState<any | null>(null);
  const [sendReceiptsFor, setSendReceiptsFor] = React.useState<any | null>(null);
  const [showCreateRecouvrement, setShowCreateRecouvrement] = React.useState(false);
  // Local search/filter state for the recouvrement declarations view (matches Chauffeur layout)
  const [searchTerm, setSearchTerm] = React.useState('');
  const [statusFilter, setStatusFilter] = React.useState('all');
  const auth = useAuth();

  const handleDeleteReceipt = async (id: string) => {
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
    } catch (e) {
      alert(e.message || t('forms.deleteFailed') || 'Suppression échouée');
    }
  };

  // Gestion du profil (mobile et desktop)
  if (activeTab === 'profile') {
    if (isMobile) {
      // En mobile, pas de Header global, profil centré
      return (
        <div className="max-w-[430px] mx-auto bg-background min-h-screen flex flex-col">
          <div className="p-6">
            <div className="text-center text-muted-foreground">{t('caissier.profileTitle')}</div>
          </div>
        </div>
      );
    }
    // Desktop : Header global + contenu profil centré
    return (
      <div>
        <Header onProfileClick={() => setActiveTab('dashboard')} />
        <div className="p-6">
          <div className="text-center text-muted-foreground">{t('caissier.profileTitle')}</div>
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
          onTabChange={tab => setActiveTab(tab as 'dashboard' | 'paiement' | 'tracage' | 'profile')}
        />
        <main className="flex-1 min-w-0 p-6 pt-16 overflow-auto">
          {/* Affichage façade selon la tab sélectionnée */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="mb-4">
                <h1 className="text-2xl font-bold">{t('caissier.dashboardTitle') || 'Tableau de bord - Caissier'}</h1>
              </div>
              {/* Constrain stats width like Planificateur to avoid occupying too much horizontal space */}
              <div className="w-full max-w-xl">
                <CaissierStats
                  stats={{ recouvrements: recouvrementsCount, paymentsPending: paymentsNotValidatedCount, paymentsNoCompany: paymentsNoCompanyCount }}
                  onRecouvrementsClick={() => { setStatusFilter('non_recouvre'); setPaymentInitialFilter('all'); setPaymentInitialCompanyFilter('all'); setActiveTab('recouvrement'); }}
                  onPaymentsPendingClick={() => { setPaymentInitialFilter('brouillon'); setPaymentInitialCompanyFilter('all'); setActiveTab('paiement'); }}
                  onPaymentsNoCompanyClick={() => { setPaymentInitialFilter('all'); setPaymentInitialCompanyFilter('no-company'); setActiveTab('paiement'); }}
                />
              </div>
            </div>
          )}
          {activeTab === 'recouvrement' && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{t('caissier.recouvrementTitle') || 'Gestion des Recouvrements'}</h2>
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowCreateRecouvrement(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {addLabel}
                  </Button>
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
                    if (declIdsWithPayments.has(d.id)) return true;
                    if (Array.isArray((d as any).paymentReceipts) && (d as any).paymentReceipts.length > 0) return true;
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
                    <Button onClick={() => setShowCreatePayment(true)} className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t('planificateur.add')}
                    </Button>
                </div>
              </div>
              <div className={(isMobile ? 'overflow-x-auto ' : '') + 'mb-2'}>
                <PaymentReceiptsTable
                  receipts={receipts}
                  onConsultReceipt={(r) => setConsultReceipt(r)}
                  initialStatusFilter={paymentInitialFilter}
                  initialCompanyFilter={paymentInitialCompanyFilter}
                  fontSize={isMobile ? '60' : localFontSize}
                  mobile={isMobile}
                />
              </div>
              <EditPaymentDialog receipt={consultReceipt} isOpen={!!consultReceipt} onClose={() => setConsultReceipt(null)} readOnly={true} />
              <EditPaymentDialog receipt={editReceipt} isOpen={!!editReceipt} onClose={() => setEditReceipt(null)} onSave={(updated) => { /* parent can refresh or handle */ setEditReceipt(null); }} />
              <ValidatePaymentDialog receipt={validateReceipt} isOpen={!!validateReceipt} onClose={() => setValidateReceipt(null)} onValidated={(updated) => {
                // parent can refresh or update local state; we rely on the payments listener to update
                setValidateReceipt(null);
              }} />
              <CreatePaymentDialog isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} />
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
