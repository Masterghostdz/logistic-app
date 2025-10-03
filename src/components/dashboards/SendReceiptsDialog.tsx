import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { useTranslation } from '../../hooks/useTranslation';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from '../ui/alert-dialog';
import { PaymentReceipt, Company } from '../../types';
import CameraPreviewModal from '../CameraPreviewModal';
import { toast } from '../ui/use-toast';
import { useIsMobile } from '../../hooks/use-mobile';
import { useSettings } from '../../contexts/SettingsContext';
import { getCompanies } from '../../services/companyService';
import { useAuth } from '../../contexts/AuthContext';

interface SendReceiptsDialogProps {
  receipts: PaymentReceipt[];
  isOpen: boolean;
  onClose: () => void;
  onValidateReceipt?: (receipt: PaymentReceipt) => void;
  onDeleteReceipt?: (id: string, skipConfirmation?: boolean) => void;
  declarationReference?: string;
  declarationId?: string;
  // optional parent handler to open the preview in the global app frame
  onOpenPreview?: (photoUrl: string) => void;
}

const SendReceiptsDialog: React.FC<SendReceiptsDialogProps> = ({ receipts, isOpen, onClose, onValidateReceipt, onDeleteReceipt, declarationReference, declarationId, onOpenPreview }) => {
  const { t, settings: tSettings } = useTranslation();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [localAmounts, setLocalAmounts] = useState<Record<string, number>>({});
  const [localCompany, setLocalCompany] = useState<Record<string, string>>({});
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [validatingIds, setValidatingIds] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  // Photo-first upload controls (reuse CreatePaymentDialog behavior)
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  // mobile detection
  const hookIsMobile = useIsMobile();
  const { settings } = useSettings();
  const isMobile = (settings?.viewMode === 'mobile') || hookIsMobile;
  const auth = useAuth();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await getCompanies();
        if (!mounted) return;
        setCompanies(list as Company[]);
      } catch (e) {
        console.warn('Failed to load companies', e);
      }
    })();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    const amounts: Record<string, number> = {};
    const comps: Record<string, string> = {};
    for (const r of receipts) {
      if (typeof r.montant === 'number') amounts[r.id] = r.montant as number;
      if (r.companyId) comps[r.id] = r.companyId;
    }
    setLocalAmounts(amounts);
    setLocalCompany(comps);
  }, [receipts]);

  // manage preview object URL for local photoFile
  useEffect(() => {
    if (!photoFile) {
      setLocalPreviewUrl(null);
      return;
    }
    const url = typeof photoFile === 'string' ? photoFile : URL.createObjectURL(photoFile);
    setLocalPreviewUrl(url);
    return () => {
      if (typeof photoFile !== 'string') URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  const handleAmountChange = (id: string, val: string) => {
    const num = parseFloat(val || '0') || 0;
    setLocalAmounts(prev => ({ ...prev, [id]: num }));
  };

  const handleCompanyChange = (id: string, compId: string) => {
    setLocalCompany(prev => ({ ...prev, [id]: compId }));
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) {
      setPhotoFile(f);
      // start add flow
      void handleAddPhotoFile(f);
    }
  };

  const handlePhotoTaken = async (dataUrl: string) => {
    try {
      setLocalPreviewUrl(dataUrl);
      // convert to File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: blob.type });
      setPhotoFile(file);
      setCameraOpen(false);
      await handleAddPhotoFile(file, dataUrl);
    } catch (e) {
      console.error('Failed to convert photo', e);
      setAddError(t('payment.errors.saveFailed') || 'Erreur lors de la conversion de la photo');
    }
  };

  const handleAddPhotoFile = async (file: File, fallbackDataUrl?: string) => {
    setAddError(null);
    setAdding(true);
    try {
      let photoUrl = '';
      let uploadPending = false;
      try {
        const { uploadDeclarationPhotos } = await import('../../services/declarationService');
        const urls = await uploadDeclarationPhotos([file]);
        photoUrl = urls[0];
      } catch (uploadErr) {
        console.error('Upload failed, saving receipt locally with pending flag', uploadErr);
        photoUrl = fallbackDataUrl || localPreviewUrl || '';
        uploadPending = true;
      }

      const newPayment: any = {
        photoUrl,
        // avoid undefined fields — Firestore rejects undefined
        year: null,
        month: null,
        programNumber: null,
        programReference: declarationReference || null,
        companyId: null,
        companyName: null,
        notes: '',
        montant: 0,
        status: 'brouillon',
        validatedAt: null,
        uploadPending,
        createdAt: new Date().toISOString(),
        createdBy: auth.user?.id || null,
        chauffeurId: null,
        declarationId: declarationId || null,
        traceability: [{ userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.paymentReceiptCreated') || 'Reçu de paiement créé', date: new Date().toISOString() }]
      };

      const { addPayment } = await import('../../services/paymentService');
      await addPayment(newPayment);

      // parent receipts listener should pick up the new payment and re-render
    } catch (e: any) {
      console.error('Failed to add payment', e);
      setAddError(e?.message || (t('payment.errors.saveFailed') || 'Erreur lors de l\'enregistrement'));
    } finally {
      setAdding(false);
      setPhotoFile(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl mx-4" aria-describedby="send-receipts-description">
        <div id="send-receipts-description" className="sr-only">{t('payments.sendDialogDescription') || 'Envoyer des reçus de paiement'}</div>
        <DialogHeader>
          <DialogTitle>{t('payments.sendReceipts') || 'Envoyer des reçus'}</DialogTitle>
          {declarationReference && (
            <div className="text-sm text-muted-foreground mt-1">{declarationReference}</div>
          )}
        </DialogHeader>
        <div className="space-y-4">
          {/* Photo-first upload controls: gallery upload + camera (mobile) */}
          <div className="flex items-center gap-2">
            <label htmlFor="send-receipts-upload-gallery" className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition" title={t('forms.import') || 'Importer une photo'}>
              +
              <input
                id="send-receipts-upload-gallery"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileInputChange}
              />
            </label>
            {/* camera on mobile */}
            <button
              type="button"
              onClick={() => setCameraOpen(true)}
              className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition"
              title={t('buttons.camera') || 'Prendre une photo'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                <rect x="3" y="7" width="18" height="13" rx="2" stroke="white" strokeWidth="2" fill="none" />
                <circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="2" fill="none" />
                <rect x="8" y="3" width="8" height="4" rx="1" stroke="white" strokeWidth="2" fill="none" />
              </svg>
            </button>
            {localPreviewUrl && (
              <div className="ml-2">
                <div className="relative w-16 h-16 border rounded overflow-hidden bg-muted">
                  <img src={localPreviewUrl} alt="preview" className="object-cover w-full h-full" onError={(e:any) => (e.currentTarget.style.display = 'none')} />
                </div>
              </div>
            )}
            {addError && <div className="text-red-600 text-sm ml-2">{addError}</div>}
          </div>
          {receipts.length === 0 ? (
            <div className="text-muted-foreground">{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</div>
          ) : (
            <div className="space-y-2">
              {receipts.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 bg-card dark:bg-muted flex items-center gap-3">
                  <div className="w-28 flex-shrink-0">
                    <button type="button" onClick={() => { if (onOpenPreview) onOpenPreview(r.photoUrl); else setPreviewPhotoUrl(r.photoUrl); }} className="block p-0 m-0 w-full h-20 overflow-hidden rounded-md border">
                      <img src={r.photoUrl} alt={`recu-${r.id}`} className="object-cover w-full h-full" onError={(e:any) => (e.currentTarget.style.display = 'none')} />
                    </button>
                  </div>
                  {/* programReference intentionally hidden here per Caissier UI request */}
                  <div className="w-44">
                    <Label htmlFor={`montant-${r.id}`}>{t('forms.amount') || 'Montant'}</Label>
                    <Input id={`montant-${r.id}`} type="number" value={localAmounts[r.id] ?? ''} onChange={(e) => handleAmountChange(r.id, e.target.value)} className="bg-background dark:bg-background" />
                  </div>
                  <div className="w-56">
                    <Label htmlFor={`company-${r.id}`}>{t('companies.name') || 'Société'}</Label>
                    <select id={`company-${r.id}`} value={localCompany[r.id] || ''} onChange={(e) => handleCompanyChange(r.id, e.target.value)} className="w-full border rounded px-2 py-1 bg-background dark:bg-background">
                      <option value="">{t('companies.select') || 'Sélectionner une société'}</option>
                      {companies.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className={`${settings.language === 'ar' ? 'mr-auto' : 'ml-auto'} flex gap-2`}>
                    {/* Decide which buttons to show based on payment status */}
                    {(() => {
                      const st = String(r.status || '').toLowerCase();
                      const isPending = ['brouillon', 'pending'].includes(st);
                      const isValidated = ['validee', 'validated', 'valide', 'valid'].includes(st);
                      const isCancelled = ['annule', 'annulé', 'cancelled'].includes(st);
                      return (
                        <>
                          {isPending && (
                            <>
                              {onDeleteReceipt && (
                                <>
                                  <Button size="sm" variant="ghost" className="text-red-600" title={t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'} onClick={() => { setReceiptToDelete(r.id); setDeleteDialogOpen(true); }}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                                  </Button>
                                </>
                              )}
                              {
                                // Validate directly without opening the validation dialog
                              }
                              <button title={t('payments.validate') || 'Valider'} onClick={async () => {
                                // direct validation: use local values and persist
                                const compId = localCompany[r.id] || '';
                                const montantValue = Number(localAmounts[r.id] || 0);
                                if (!montantValue) {
                                  toast({ title: t('forms.required') || 'Montant requis', variant: 'destructive' });
                                  return;
                                }
                                if (!compId) {
                                  toast({ title: t('companies.select') || 'Société requise', variant: 'destructive' });
                                  return;
                                }
                                try {
                                  setValidatingIds(prev => ({ ...prev, [r.id]: true }));
                                  const { updatePayment, getPayments } = await import('../../services/paymentService');
                                  const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.validated') || 'Déclaration Validée', date: new Date().toISOString() };
                                  const updates: any = {
                                    montant: montantValue,
                                    companyId: compId,
                                    companyName: companies.find((c: any) => c.id === compId)?.name || null,
                                    status: 'validee',
                                    validatedAt: new Date().toISOString()
                                  };
                                  try {
                                    const current: any = (await getPayments()).find((p: any) => p.id === r.id) || {};
                                    updates.traceability = [...(current.traceability || []), traceEntry];
                                  } catch (e) {
                                    updates.traceability = [traceEntry];
                                  }
                                  await updatePayment(r.id, updates);
                                  if (onValidateReceipt) onValidateReceipt({ ...r, ...updates } as PaymentReceipt);
                                } catch (e: any) {
                                  console.error('Validation failed', e);
                                  toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'opération'), variant: 'destructive' });
                                } finally {
                                  setValidatingIds(prev => ({ ...prev, [r.id]: false }));
                                }
                              }} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900" disabled={!!validatingIds[r.id]}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                              </button>
                            </>
                          )}
                          {isValidated && (
                            <button title={t('payments.undo') || 'Annuler'} onClick={async () => {
                              // Attempt to revert the receipt status to pending
                              try {
                                const { updatePayment } = await import('../../services/paymentService');
                                await updatePayment(r.id, { status: 'brouillon' });
                              } catch (e) {
                                console.error('Undo failed', e);
                                toast({ title: t('forms.error') || 'Erreur lors de l\'opération', variant: 'destructive' });
                              }
                            }} className="p-2 rounded border border-border text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900">
                              {/* Representative Undo icon */}
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 10-9 9" />
                                <path d="M21 3v9h-9" />
                              </svg>
                            </button>
                          )}
                          {!isValidated && !isPending && onValidateReceipt && (
                            <button title={t('payments.validate') || 'Valider'} onClick={() => onValidateReceipt(r)} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                            </button>
                          )}
                        </>
                      );
                    })()}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={onClose}>{t('forms.close') || 'Fermer'}</Button>
            {(() => {
              const allValidated = receipts.length > 0 && receipts.every(r => ['validee', 'validated', 'valide', 'valid'].includes(String(r.status || '').toLowerCase()));
              const handleSend = async () => {
                if (!allValidated) return;
                if (!declarationId) {
                  // fallback: just close
                  onClose();
                  return;
                }
                try {
                  const { updateDeclaration } = await import('../../services/declarationService');
                  const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.sentReceipts') || 'Reçus envoyés', date: new Date().toISOString() };
                  const updates: any = {
                    paymentState: 'recouvre',
                    paymentRecoveredAt: new Date().toISOString()
                  };
                  await updateDeclaration(declarationId, updates, traceEntry);
                  onClose();
                } catch (e: any) {
                  console.error('Send receipts failed', e);
                  toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'envoi'), variant: 'destructive' });
                }
              };

              return (
                <Button onClick={handleSend} className={`bg-green-600 text-white ${!allValidated ? 'opacity-50 pointer-events-none' : ''}`} disabled={!allValidated}>
                  {t('payments.send') || 'Envoyer'}
                </Button>
              );
            })()}
          </div>
        </div>
        {previewPhotoUrl && createPortal(
          <div className="fixed inset-0 z-[99999] flex items-center justify-center bg-black/70 pointer-events-auto" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewPhotoUrl(null); }} onPointerDownCapture={(e) => e.stopPropagation()} onMouseDownCapture={(e) => e.stopPropagation()}>
            <div className="bg-white dark:bg-slate-900 rounded-lg shadow-lg p-2 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
              <img src={previewPhotoUrl} alt="Aperçu reçu" className="max-w-[90vw] max-h-[80vh] rounded-lg" />
              <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded" onClick={(e) => { e.stopPropagation(); e.preventDefault(); setPreviewPhotoUrl(null); }}>Fermer</button>
            </div>
          </div>,
          document.body
        )}
  {/* Camera modal for photo-first flow */}
  <CameraPreviewModal isOpen={cameraOpen} onPhotoTaken={handlePhotoTaken} onClose={() => setCameraOpen(false)} />
        {/* Delete confirmation dialog (in-app) */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setReceiptToDelete(null); }}>
                <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('payments.confirmDeleteTitle') || 'Supprimer le reçu'}</AlertDialogTitle>
              <AlertDialogDescription>{t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-0" onClick={() => { setDeleteDialogOpen(false); setReceiptToDelete(null); }}>{t('forms.cancel') || 'Annuler'}</AlertDialogCancel>
              <AlertDialogAction onClick={async () => {
                if (receiptToDelete && onDeleteReceipt) {
                  try {
                    // pass skipConfirmation=true so parent doesn't re-open confirmation
                    await onDeleteReceipt(receiptToDelete, true as any);
                  } catch (e) {
                    console.error('Delete receipt failed', e);
                    toast({ title: t('forms.error') || 'Erreur lors de la suppression', variant: 'destructive' });
                  }
                }
                setDeleteDialogOpen(false);
                setReceiptToDelete(null);
              }}>{t('forms.confirm') || 'Supprimer'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default SendReceiptsDialog;
