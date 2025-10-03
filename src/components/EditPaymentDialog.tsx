import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Dialog as ConfirmDialog, DialogContent as ConfirmContent, DialogHeader as ConfirmHeader, DialogFooter as ConfirmFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';
import { useSharedData } from '../contexts/SharedDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';
import CameraPreviewModal from './CameraPreviewModal';
import TraceabilitySection from './TraceabilitySection';
import * as declarationService from '../services/declarationService';
import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';

interface EditPaymentDialogProps {
  receipt: any | null;
  isOpen: boolean;
  onClose: () => void;
  onSave?: (receipt: any) => void;
  readOnly?: boolean;
}

const EditPaymentDialog: React.FC<EditPaymentDialogProps> = ({ receipt, isOpen, onClose, onSave, readOnly = false }) => {
  const { t } = useTranslation();
  const { companies, declarations } = useSharedData();
  const auth = useAuth();
  const { settings } = useSettings();
  const hookIsMobile = useIsMobile();
  const isMobile = settings?.viewMode === 'mobile' || hookIsMobile;

  const [photoFile, setPhotoFile] = useState<File | string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [confirmReplaceOpen, setConfirmReplaceOpen] = useState(false);
  const [pendingNewFile, setPendingNewFile] = useState<File | null>(null);
  const [companyId, setCompanyId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [montant, setMontant] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [programNumber, setProgramNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const loadingCtx = useLoading();

  useEffect(() => {
    if (!receipt) return;
    setCompanyId(receipt.companyId || '');
    setNotes(receipt.notes || '');
    setMontant(receipt.montant ? String(receipt.montant) : '');
    setYear(receipt.year || '');
    setMonth(receipt.month || '');
    setProgramNumber(receipt.programNumber || '');
    setPhotoFile(receipt.photoUrl || null);
    // resolve creator display name: prefer createdByName, otherwise lookup user by id
    setCreatorName(null);
    if (receipt.createdByName) {
      setCreatorName(receipt.createdByName);
    } else if (receipt.createdBy) {
      (async () => {
        try {
          const { getUsers } = await import('../services/userService');
          const users = await getUsers();
          const u = (users || []).find((x: any) => x.id === receipt.createdBy);
          if (u) setCreatorName(u.fullName || u.username || receipt.createdBy);
          else setCreatorName(receipt.createdBy);
        } catch (e) {
          setCreatorName(receipt.createdBy);
        }
      })();
    }
  }, [receipt]);

  // Manage preview URL for selected file or existing photoUrl
  useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      return;
    }
    if (typeof photoFile === 'string') {
      setPreviewUrl(photoFile);
      return;
    }
    const url = URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => {
      if (typeof photoFile !== 'string') URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  if (!receipt) return null;

  const reset = () => {
    setPhotoFile(receipt.photoUrl || null);
    setCompanyId(receipt.companyId || '');
    setNotes(receipt.notes || '');
    setYear(receipt.year || '');
    setMonth(receipt.month || '');
    setProgramNumber(receipt.programNumber || '');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    // If editing and an existing photoUrl exists, confirm replacement
    const hasExisting = !!(receipt && receipt.photoUrl);
    if (hasExisting && photoFile && typeof photoFile === 'string') {
      // queue the new file and open confirm
      setPendingNewFile(f);
      setConfirmReplaceOpen(true);
    } else {
      setPhotoFile(f);
    }
  };

  const applyPendingFile = () => {
    if (pendingNewFile) {
      setPhotoFile(pendingNewFile);
      setPendingNewFile(null);
    }
    setConfirmReplaceOpen(false);
  };

  const cancelPendingFile = () => {
    setPendingNewFile(null);
    setConfirmReplaceOpen(false);
  };

  const handlePhotoTaken = async (dataUrl: string) => {
    try {
      setPreviewUrl(dataUrl);
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: blob.type });
      setPhotoFile(file);
      setCameraOpen(false);
    } catch (e) {
      console.error('Failed to convert photo', e);
    }
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (readOnly) return;
  setLoading(true);
  try { loadingCtx.show(t('forms.saving') || 'Enregistrement...'); } catch (e) {}
    try {
      // Find parent declaration by components
      const declaration = declarations.find(d => String(d.programNumber) === String(programNumber) && String(d.year) === String(year) && String(d.month) === String(month));

      let photoUrl = typeof photoFile === 'string' ? photoFile : '';
      let uploadPending = false;
      if (photoFile && typeof photoFile !== 'string') {
        try {
          const urls = await declarationService.uploadDeclarationPhotos([photoFile]);
          photoUrl = urls[0];
        } catch (uploadErr) {
          console.error('Upload failed', uploadErr);
          photoUrl = previewUrl || '';
          uploadPending = true;
        }
      }

      const updatedPayment = {
        ...receipt,
        photoUrl: photoUrl || receipt.photoUrl,
        companyId: companyId || null,
        notes: notes || '',
        montant: montant ? Number(montant) : undefined,
        year,
        month,
        programNumber,
        programReference: `DCP/${year}/${month}/${programNumber}`,
        companyName: companies.find((c: any) => c.id === (companyId || receipt.companyId))?.name || receipt.companyName || null,
        uploadPending: uploadPending || false,
        status: 'validee',
        validatedAt: new Date().toISOString(),
      };

      if (onSave) {
        onSave(updatedPayment);
      } else {
        // Persist top-level payment doc
        const { updatePayment, addPayment } = await import('../services/paymentService');
        if (receipt.id && receipt.id.startsWith('local-')) {
          // local ID, create new payment doc
          (updatedPayment as any).createdBy = auth.user?.id || null;
          (updatedPayment as any).createdByName = auth.user?.fullName || null;
          (updatedPayment as any).traceability = [
            { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.paymentReceiptCreated'), date: new Date().toISOString() }
          ];
          const createdRef = await addPayment(updatedPayment);
          // if declaration exists, add traceability
          if (declaration) {
            const traceEntry = {
              userId: auth.user?.id || null,
              userName: auth.user?.fullName || null,
              action: t('traceability.paymentReceiptCreated'),
              date: new Date().toISOString()
            };
            const updatedTrace = [...(declaration.traceability || []), traceEntry];
            await declarationService.updateDeclaration(declaration.id, { traceability: updatedTrace });
          }
        } else if (receipt.id) {
          // existing payment - update
          // add a modification trace entry to payment doc
          const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.paymentReceiptCreated'), date: new Date().toISOString() };
          const paymentUpdates: any = { ...updatedPayment };
          // append to existing traceability in the doc via read-modify-write
          try {
            const { getPayments } = await import('../services/paymentService');
            // best-effort: fetch current payment and merge traceability
            const current: any = (await getPayments()).find((p: any) => p.id === receipt.id) || {};
            paymentUpdates.traceability = [...(current.traceability || []), traceEntry];
          } catch (e) {
            paymentUpdates.traceability = [traceEntry];
          }
          await updatePayment(receipt.id, paymentUpdates);
          if (declaration) {
            const traceEntry = {
              userId: auth.user?.id || null,
              userName: auth.user?.fullName || null,
              action: t('traceability.paymentReceiptCreated'),
              date: new Date().toISOString()
            };
            const updatedTrace = [...(declaration.traceability || []), traceEntry];
            await declarationService.updateDeclaration(declaration.id, { traceability: updatedTrace });
          }
        }
      }

      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      try { loadingCtx.hide(); } catch (e) {}
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={val => { if (!val) { reset(); onClose(); } }}>
        <DialogContent className={readOnly ? 'max-w-3xl' : 'max-w-md'}>
          <DialogHeader>
            <DialogTitle>{readOnly ? (t('caissier.viewPaymentTitle') || 'Consulter le reçu') : (t('caissier.createPaymentTitle') || 'Modifier le reçu')}</DialogTitle>
            <DialogDescription>{readOnly ? (t('caissier.viewPaymentDesc') || 'Consultation du reçu (lecture seule)') : (t('caissier.createPaymentDesc') || '')}</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-4">
            <div>
              <Label>{t('forms.photo') || 'Photo'} {readOnly ? '' : '*'}</Label>
              {readOnly ? (
                // Large centered preview for consultation
                <div className="w-full flex justify-center mt-4">
                  <div className="bg-muted rounded overflow-hidden" style={{ width: 'min(720px, 92%)', height: 'auto' }}>
                    <img src={previewUrl || receipt.photoUrl} alt="reçu" className="object-contain w-full h-auto bg-black" />
                  </div>
                </div>
              ) : (
                <div className="flex gap-2 items-center mt-2">
                  <label htmlFor="edit-payment-upload-gallery" className={`w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition mr-2 ${readOnly ? 'pointer-events-none opacity-60' : ''}`} title={t('forms.import') || 'Importer une photo'}>
                    +
                    <input
                      id="edit-payment-upload-gallery"
                      type="file"
                      accept="image/*"
                      className="hidden"
                        onChange={handleFileChange}
                      disabled={readOnly}
                    />
                  </label>

                  {isMobile && (
                    <button
                      type="button"
                      onClick={() => setCameraOpen(true)}
                      className={`w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition ${readOnly ? 'pointer-events-none opacity-60' : ''}`}
                      title={t('buttons.camera') || 'Prendre une photo'}
                      disabled={readOnly}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                        <rect x="3" y="7" width="18" height="13" rx="2" stroke="white" strokeWidth="2" fill="none" />
                        <circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="2" fill="none" />
                        <rect x="8" y="3" width="8" height="4" rx="1" stroke="white" strokeWidth="2" fill="none" />
                      </svg>
                    </button>
                  )}

                  {previewUrl && (
                    <div className="ml-2">
                      <div className="relative w-16 h-16 border rounded overflow-hidden bg-muted">
                        <img src={previewUrl} alt="preview" className="object-cover w-full h-full" onError={e => (e.currentTarget.style.display = 'none')} />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* read-only creator and traceability are shown at the end of the form */}

            <SimpleDeclarationNumberForm
              onNumberChange={(full) => setProgramNumber(full ? full.split('/').pop() || '' : '')}
              onComponentsChange={(y, m, pn) => { setYear(y); setMonth(m); setProgramNumber(pn); }}
              initialYear={year}
              initialMonth={month}
              initialProgramNumber={programNumber}
              readOnly={readOnly}
            />

            <div>
              <Label htmlFor="company">{t('companies.company') || t('companies.name') || 'Société'}</Label>
              {!readOnly ? (
                <Select value={companyId} onValueChange={(v: string) => setCompanyId(v)}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('companies.select') || t('companies.name') || 'Sélectionner une société'} />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map(c => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <div className="mt-1">{receipt.companyName || ''}</div>
              )}
            </div>

            <div>
              <Label htmlFor="montant">{t('financial.amount') || t('forms.amount') || 'Montant (DZD)'}</Label>
              {!readOnly ? (
                <Input id="montant" value={montant} onChange={e => setMontant(e.target.value)} />
              ) : (
                <div className="mt-1">{typeof receipt.montant === 'number' ? `${receipt.montant.toFixed(2)} DZD` : ''}</div>
              )}
            </div>

            <div>
              <Label htmlFor="notes">{t('forms.notes') || 'Notes'}</Label>
              <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} disabled={readOnly} />
            </div>

            {readOnly && (
              <div>
                <Label>{t('forms.creator') || 'Créateur'}</Label>
                <div className="mt-1">{creatorName || receipt.createdByName || receipt.createdBy || t('traceability.unknownUser') || 'Utilisateur inconnu'}</div>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              {!readOnly && (
                <Button type="submit" className="flex-1" disabled={loading}>{loading ? (t('buttons.saving') || 'Enregistrement...') : (t('forms.save') || 'Sauvegarder')}</Button>
              )}
              <Button type="button" variant="outline" onClick={() => { reset(); onClose(); }}>{readOnly ? (t('forms.close') || 'Fermer') : (t('forms.cancel') || 'Annuler')}</Button>
            </div>
            {readOnly && (
              <TraceabilitySection
                traces={receipt.traceability}
                label={t('declarations.history') || t('forms.traceability') || 'Historique'}
                emptyText={t('traceability.none') || 'Aucune trace'}
              />
            )}
          </form>
        </DialogContent>
      </Dialog>

        <CameraPreviewModal isOpen={cameraOpen} onPhotoTaken={handlePhotoTaken} onClose={() => setCameraOpen(false)} />

        {/* Confirmation dialog for replacing an existing photo */}
        <ConfirmDialog open={confirmReplaceOpen} onOpenChange={(v) => { if (!v) cancelPendingFile(); }}>
          <ConfirmContent className="max-w-sm">
            <ConfirmHeader>
              <DialogTitle>{t('forms.confirm') || 'Confirmation'}</DialogTitle>
              <DialogDescription>{t('forms.replacePhotoConfirm') || 'Un fichier existe déjà. Voulez-vous le remplacer par la nouvelle photo ?'}</DialogDescription>
            </ConfirmHeader>
            <ConfirmFooter>
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => cancelPendingFile()}>{t('forms.no') || 'Non'}</Button>
                <Button onClick={() => applyPendingFile()}>{t('forms.yes') || 'Oui'}</Button>
              </div>
            </ConfirmFooter>
          </ConfirmContent>
        </ConfirmDialog>
    </>
  );
};

export default EditPaymentDialog;
