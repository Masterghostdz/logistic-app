import { Chauffeur } from '../types';
import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';  
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Declaration, User } from '../types';
import { getAllRefusalReasons } from '../services/refusalReasonService';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import TraceabilitySection from './TraceabilitySection';
import useTableZoom from '../hooks/useTableZoom';
import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';

// Inline helper component: lists payments for a given declaration (or matching program)
const PaymentsForDeclaration: React.FC<{ declaration?: Declaration | null; readOnly?: boolean }> = ({ declaration, readOnly = false }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const { t } = useTranslation();
  const { badgeClass, badgeStyle } = useTableZoom();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const authCtx = useAuth();

  // listen for payments and filter those related to the given declaration
  React.useEffect(() => {
    let unsub: (() => void) | undefined;
    (async () => {
      const { listenPayments } = await import('../services/paymentService');
      unsub = listenPayments((items: any[]) => {
        if (!declaration) {
          setPayments([]);
          return;
        }
        const declRef = `DCP/${declaration.year}/${declaration.month}/${declaration.programNumber}`;
        let filtered = items.filter(p => {
          try {
            if (p.declarationId && declaration.id && String(p.declarationId) === String(declaration.id)) return true;
            if (!p.declarationId && p.programReference && declRef && String(p.programReference) === String(declRef)) return true;
            if (!p.declarationId && declaration.programNumber && declaration.year && declaration.month) {
              const pnMatch = String(p.programNumber || '') === String(declaration.programNumber || '');
              const yearMatch = String(p.year || '') === String(declaration.year || '');
              const monthMatch = String(p.month || '') === String(declaration.month || '');
              const authorMatch = (p.chauffeurId && p.chauffeurId === declaration.chauffeurId) || (p.createdBy && p.createdBy === declaration.chauffeurId);
              if (pnMatch && yearMatch && monthMatch && authorMatch) return true;
            }
          } catch (e) {
            // ignore
          }
          return false;
        });
        // If the current user is an external cashier (caissier externe), only show receipts
        // that belong to the same company as the user. This ensures external cashiers
        // consulting a declaration only see receipts for their company.
        try {
          const user = authCtx.user;
          if (user && user.role === 'caissier' && (user as any).employeeType === 'externe' && user.companyId) {
            filtered = filtered.filter(p => String(p.companyId || '') === String(user.companyId));
          }
        } catch (e) {
          // ignore
        }
        setPayments(filtered);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, [declaration]);

  const getStatusBadgeFor = (p: any) => {
    const s = String(p.status || '').toLowerCase();
    if (['brouillon', 'pending', 'pending_validation'].includes(s)) {
      const label = (s === 'pending' && !p.uploadPending) ? (t('declarations.synchronized') || 'Synchronisé') : (t('dashboard.pending') || 'En attente');
      return <Badge size="sm" style={{ ...badgeStyle }} className={`bg-yellow-100 text-yellow-800 ${badgeClass}`}>{label}</Badge>;
    }
    if (['validee', 'validated', 'valid', 'valide'].includes(s)) {
      return <Badge size="sm" style={{ ...badgeStyle }} className={`bg-green-100 text-green-800 ${badgeClass}`}>{t('dashboard.validated') || 'Validé'}</Badge>;
    }
    if (['refuse', 'refused', 'rejected'].includes(s)) {
      return <Badge size="sm" style={{ ...badgeStyle }} className={`bg-red-100 text-red-800 ${badgeClass}`}>{t('declarations.refused') || 'Refusé'}</Badge>;
    }
    return <Badge size="sm" variant="outline" style={{ ...badgeStyle }} className={badgeClass}>{p.status}</Badge>;
  };

  const handleDelete = async (p: any) => {
    const ok = window.confirm(t('forms.confirm') || 'Confirmer la suppression ?');
    if (!ok) return;
    try {
      if (!authCtx.user) {
        alert(t('forms.unauthorized') || 'Non autorisé');
        return;
      }
      if (p.id) {
        const { safeDeletePayment } = await import('../services/paymentService');
        await safeDeletePayment(p.id, authCtx.user);
      }
    } catch (e) {
      console.warn('Failed to delete payment', e);
      alert(e.message || t('forms.deleteFailed') || 'Suppression échouée');
    }
  };

  if (!declaration) return <span className="text-muted-foreground text-xs italic">{t('declarations.noReceiptsAdded') || 'Aucun reçu lié'}</span>;
  if (payments.length === 0) return <span className="text-muted-foreground text-xs italic">{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</span>;

  return (
    <div className="flex flex-col gap-2">
      {payments.map((p, idx) => (
        <div key={p.id || idx} className="border rounded-lg p-3 bg-card dark:bg-muted flex items-center gap-3 w-full min-w-full">
          <div className="w-28 flex-shrink-0">
            <button type="button" onClick={() => setPreviewPhotoUrl(p.photoUrl)} className="block p-0 m-0 w-full h-20 overflow-hidden rounded-md border">
              <img src={p.photoUrl} alt={`recu-${idx}`} className="object-cover w-full h-full" onError={(e:any) => (e.currentTarget.style.display = 'none')} />
            </button>
          </div>

          <div className="w-44">
            <Label className="text-xs">{t('forms.amount') || 'Montant'}</Label>
            {String((declaration as any).paymentState || '').toLowerCase() === 'recouvre' ? (
              <Input id={`montant-${p.id}`} type="text" value={typeof p.montant === 'number' ? p.montant.toFixed(2) : ''} disabled className="bg-background dark:bg-background" />
            ) : (
              <div className="text-sm text-muted-foreground">{typeof p.montant === 'number' ? p.montant.toFixed(2) : ''}</div>
            )}
          </div>

          <div className="w-56">
            <Label className="text-xs">{t('companies.name') || 'Société'}</Label>
            {String((declaration as any).paymentState || '').toLowerCase() === 'recouvre' ? (
              <Input id={`company-${p.id}`} value={p.companyName || ''} disabled className="w-full bg-background dark:bg-background" />
            ) : (
              <div className="text-sm text-muted-foreground truncate">{p.companyName || ''}</div>
            )}
          </div>

          <div className={`${(useSettings().settings?.language === 'ar') ? 'mr-auto' : 'ml-auto'} flex gap-2`}>
            {/* delete action if allowed */}
            {!readOnly && (() => {
              const role = authCtx.user?.role;
              const s = String(p.status || '').toLowerCase();
              const isValidated = ['validee', 'validated', 'valide', 'valid'].includes(s);
              const canDelete = !!authCtx.user && role !== 'planificateur' && !isValidated;
              if (!canDelete) return null;
              return (
                <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md text-red-600 hover:text-red-700`} onClick={() => handleDelete(p)}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </Button>
              );
            })()}

            <div className="flex flex-col items-end gap-1">
              <div className="text-xs text-muted-foreground">{getStatusBadgeFor(p)}</div>
              <div className="text-xs text-muted-foreground">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
            </div>
          </div>

          {previewPhotoUrl && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPreviewPhotoUrl(null)}>
              <div className="bg-white rounded-lg shadow-lg p-2 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
                <img src={previewPhotoUrl} alt="Aperçu reçu" className="max-w-[90vw] max-h-[80vh] rounded-lg" />
                <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded" onClick={() => setPreviewPhotoUrl(null)}>Fermer</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
};


interface EditDeclarationDialogProps {
  declaration: Declaration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (declaration: Declaration) => void;
  readOnly?: boolean;
  chauffeurs?: Chauffeur[];
}

const EditDeclarationDialog: React.FC<EditDeclarationDialogProps> = ({
  declaration,
  isOpen,
  onClose,
  onSave,
  readOnly = false,
  chauffeurs = []
}) => {
  // Récupérer le type de chauffeur à partir de la liste
  const chauffeurType = declaration?.chauffeurId
    ? chauffeurs.find((c) => c.id === declaration.chauffeurId)?.employeeType
    : undefined;
  // Récupérer le type de chauffeur
  const { t } = useTranslation();

  // Affichage du motif de refus (hook unique, bien placé)
  const [refusalReasonLabel, setRefusalReasonLabel] = useState<string | null>(null);
  useEffect(() => {
    if (declaration && declaration.status === 'refuse' && declaration.refusalReason) {
      getAllRefusalReasons().then((reasons) => {
        const found = reasons.find(r => r.id === declaration.refusalReason);
        if (found) {
          setRefusalReasonLabel(found[t('settings.language') || 'fr'] || found['fr']);
        } else {
          setRefusalReasonLabel(null);
        }
      });
    } else {
      setRefusalReasonLabel(null);
    }
  }, [declaration, t]);


  const [formData, setFormData] = useState({
    distance: '',
    deliveryFees: '',
    notes: '',
    number: '',
    year: '',
    month: '',
    programNumber: ''
  });

  useEffect(() => {
    if (declaration) {
      setFormData({
        distance: declaration.distance?.toString() || '',
        deliveryFees: declaration.deliveryFees?.toString() || '',
        notes: declaration.notes || '',
        number: declaration.number || '',
        year: declaration.year || '',
        month: declaration.month || '',
        programNumber: declaration.programNumber || ''
      });
    }
  }, [declaration]);

  const handleSave = () => {
    if (!declaration) return;

    // Vérifier que le numéro de programme est complètement rempli (4 chiffres)
    if (!formData.programNumber || formData.programNumber.length !== 4) {
      alert('Le numéro de programme doit contenir 4 chiffres');
      return;
    }

    // Vérifier qu'au moins la distance ou les frais de livraison sont renseignés
    if (!formData.distance && !formData.deliveryFees) {
      alert('Veuillez renseigner soit la distance soit les frais de livraison');
      return;
    }

    const updatedDeclaration: Declaration = {
      ...declaration,
      distance: formData.distance ? parseInt(formData.distance) : undefined,
      deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
      notes: formData.notes,
      number: formData.number,
      year: formData.year,
      month: formData.month,
      programNumber: formData.programNumber
    };

    onSave(updatedDeclaration);
  };

  const handleNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, number }));
  };

  const handleComponentsChange = (year: string, month: string, programNumber: string) => {
    setFormData(prev => ({ 
      ...prev, 
      year, 
      month, 
      programNumber 
    }));
  };

  const { badgeClass, badgeStyle } = useTableZoom();

  // Detect mobile/desktop to adapt dialog sizing (main dialog)
  const hookIsMobile = useIsMobile();
  const { settings } = useSettings();
  const isMobile = settings?.viewMode === 'mobile' || hookIsMobile;

  // Copie de la logique getStatusBadge pour cohérence avec le tableau
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_route':
  return <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200`}>{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
  return <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200`}>{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
  return <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200`}>{t('dashboard.pending')}</Badge>;
      case 'valide':
  return <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200`}>{t('dashboard.validated')}</Badge>;
      case 'refuse':
  return <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200`}>{t('dashboard.refused')}</Badge>;
      default:
  return <Badge size="md" variant="outline" style={{ ...badgeStyle }} className={badgeClass}>{status}</Badge>;
    }
  };

  if (!declaration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={isMobile ? 'max-w-md mx-4' : 'max-w-4xl mx-6'} aria-describedby="edit-declaration-description">
        <div id="edit-declaration-description" className="sr-only">
          Ce dialogue permet de modifier ou consulter une déclaration. Remplissez les champs requis puis validez.
        </div>
        <DialogHeader>
          <DialogTitle>{readOnly ? (t('declarations.view') || 'Consulter la déclaration') : (t('forms.edit') + ' ' + (t('declarations.title') || 'la déclaration'))}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {/* Affichage de l'état de la déclaration en badge, et motif à côté si refus */}
          {readOnly && (
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(declaration.status)}
              {declaration.status === 'refuse' && refusalReasonLabel && (
                <span className="text-base font-semibold text-red-700 dark:text-red-400">{refusalReasonLabel}</span>
              )}
            </div>
          )}
          <SimpleDeclarationNumberForm
            onNumberChange={handleNumberChange}
            onComponentsChange={handleComponentsChange}
            initialYear={declaration.year}
            initialMonth={declaration.month}
            initialProgramNumber={declaration.programNumber}
            readOnly={readOnly}
          />
          <div>
            <Label htmlFor="distance">{t('declarations.distance') === 'declarations.distance' ? 'Distance (km)' : t('declarations.distance')}</Label>
            <Input
              id="distance"
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              disabled={readOnly}
            />
          </div>
          {/* Frais de livraison pour chauffeur externe uniquement */}
          {chauffeurType === 'externe' && (
            <div>
              <Label htmlFor="deliveryFees">{t('declarations.deliveryFees') === 'declarations.deliveryFees' ? 'Frais de livraison (DZD)' : t('declarations.deliveryFees')}</Label>
              <Input
                id="deliveryFees"
                type="number"
                value={formData.deliveryFees}
                onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                disabled={readOnly}
              />
            </div>
          )}
          {/* Prime de route pour chauffeur interne uniquement */}
          {chauffeurType === 'interne' && (
            <div>
              <Label htmlFor="primeDeRoute">{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route (DZD)' : t('declarations.primeDeRoute')}</Label>
              <Input
                id="primeDeRoute"
                type="number"
                value={declaration?.primeDeRoute ?? ''}
                disabled={readOnly}
              />
            </div>
          )}
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              disabled={readOnly}
            />
          </div>
          {/* Affichage toujours la section des reçus de paiement (photos), même si vide */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground text-sm font-medium mb-1">{t('declarations.paymentReceipts') || 'Reçus de paiement (photos)'}</Label>
                    <div className="flex gap-2 flex-wrap items-center min-h-[2.5rem]">
                      {/* New behaviour: list payments from payments collection linked to this declaration (preferred) */}
                      <PaymentsForDeclaration declaration={declaration} />
                    </div>
          </div>
          {/* Section traçabilité (historique) */}
          {declaration?.traceability && declaration.traceability.length > 0 && (
            <TraceabilitySection traces={declaration.traceability} />
          )}
          <div className="flex gap-2 pt-4">
            {!readOnly && (
              <Button
                onClick={handleSave}
                className="flex-1"
                disabled={!declaration?.chauffeurId || String(declaration.chauffeurId).trim() === ''}
              >
                {t('forms.save') || 'Sauvegarder'}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {readOnly ? (t('forms.close') || 'Fermer') : (t('forms.cancel') || 'Annuler')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeclarationDialog;
