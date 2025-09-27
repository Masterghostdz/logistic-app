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
import useTableZoom from '../hooks/useTableZoom';

// Inline helper component: lists payments for a given declaration (or matching program)
const PaymentsForDeclaration: React.FC<{ declaration?: Declaration | null; readOnly?: boolean }> = ({ declaration, readOnly = false }) => {
  const [payments, setPayments] = useState<any[]>([]);
  const { t } = useTranslation();
  const { badgeClass, badgeStyle } = useTableZoom();
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const authCtx = useAuth();

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
        const filtered = items.filter(p => {
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
        setPayments(filtered);
      });
    })();
    return () => { if (unsub) unsub(); };
  }, [declaration]);

  if (!declaration) return <span className="text-muted-foreground text-xs italic">{t('declarations.noReceiptsAdded') || 'Aucun reçu lié'}</span>;
  if (payments.length === 0) return <span className="text-muted-foreground text-xs italic">{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</span>;

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
    // local state will be updated by listener; no explicit removal necessary
  };

  return (
    <div className="flex flex-col gap-2">
      {payments.map((p, idx) => (
        <div key={p.id || idx} className="relative flex flex-row items-center border rounded-lg bg-muted px-3 py-2 gap-4 w-full min-h-[48px] h-auto shadow-sm">
          <button type="button" onClick={() => setPreviewPhotoUrl(p.photoUrl)} className="p-0 m-0">
            <img src={p.photoUrl} alt={`reçu-${idx}`} className="object-cover w-16 h-12 rounded-md cursor-pointer hover:opacity-80 transition" onError={e => (e.currentTarget.style.display = 'none')} />
          </button>
          <div className="flex-1 min-w-0 flex flex-col justify-center">
            <div className="font-medium truncate">{p.companyName || <span className="italic text-muted-foreground">Société non renseignée</span>}</div>
            <div className="text-xs text-muted-foreground truncate">{getStatusBadgeFor(p)}</div>
            <div className="text-xs text-muted-foreground truncate">{p.createdAt ? new Date(p.createdAt).toLocaleString() : ''}</div>
          </div>
          {!readOnly && (() => {
            const role = authCtx.user?.role;
            const s = String(p.status || '').toLowerCase();
            const isValidated = ['validee', 'validated', 'valide', 'valid'].includes(s);
            const canDelete = !!authCtx.user && role !== 'planificateur' && !isValidated;
            if (!canDelete) return null;
            return (
              <div className="ml-auto">
                <button type="button" className="p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300" onClick={() => handleDelete(p)} title={t('forms.delete') || 'Supprimer'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                </button>
              </div>
            );
          })()}
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
      <DialogContent className="max-w-md" aria-describedby="edit-declaration-description">
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
            <div className="mt-6 border-t pt-4">
              <div className="font-semibold text-sm mb-2 text-muted-foreground">Historique de la déclaration</div>
              <div className="space-y-2 text-xs">
                {declaration.traceability.map((trace, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    <span className="font-semibold">{trace.userName}</span>
                    <span className="mx-2 text-[10px]">({new Date(trace.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(trace.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})</span>
                    : {trace.action}
                  </div>
                ))}
              </div>
            </div>
          )}
          <div className="flex gap-2 pt-4">
            {!readOnly && (
              <Button onClick={handleSave} className="flex-1">
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
