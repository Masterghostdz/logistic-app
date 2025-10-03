import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';
import { useSharedData } from '../contexts/SharedDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useLoading } from '../contexts/LoadingContext';
import * as declarationService from '../services/declarationService';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';
import CameraPreviewModal from './CameraPreviewModal';
import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';

interface CreatePaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const CreatePaymentDialog: React.FC<CreatePaymentDialogProps> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const { declarations, companies } = useSharedData();
  const auth = useAuth();
  const { settings } = useSettings();
  // Always call the hook unconditionally, then prefer the app-level viewMode if set
  const hookIsMobile = useIsMobile();
  const isMobile = settings?.viewMode === 'mobile' || hookIsMobile;

  const [photoFile, setPhotoFile] = React.useState<File | null>(null);
  const [programNumber, setProgramNumber] = React.useState<string>('');
  const [year, setYear] = React.useState<string>('');
  const [month, setMonth] = React.useState<string>('');
  const [companyId, setCompanyId] = React.useState<string>('');
  const [notes, setNotes] = React.useState<string>('');
  const [montant, setMontant] = React.useState<string>('');
  const [cameraOpen, setCameraOpen] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const loadingCtx = useLoading();
  const [error, setError] = React.useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Manage object URL for preview and revoke when changed/unmounted
  React.useEffect(() => {
    if (!photoFile) {
      setPreviewUrl(null);
      return;
    }
    const url = typeof photoFile === 'string' ? photoFile : URL.createObjectURL(photoFile);
    setPreviewUrl(url);
    return () => {
      if (typeof photoFile !== 'string') URL.revokeObjectURL(url);
    };
  }, [photoFile]);

  const reset = () => {
    setPhotoFile(null);
    setProgramNumber('');
    setYear('');
    setMonth('');
    setCompanyId('');
    setNotes('');
    setError(null);
    setLoading(false);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) setPhotoFile(f);
  };

  const handlePhotoTaken = async (dataUrl: string) => {
    try {
      // show dataUrl preview immediately (no need to wait conversion)
      setPreviewUrl(dataUrl);
      // Convert dataURL to blob then File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `receipt-${Date.now()}.jpg`, { type: blob.type });
      setPhotoFile(file);
      setCameraOpen(false);
    } catch (e) {
      console.error('Failed to convert photo', e);
      setError(t('payment.errors.saveFailed') || 'Erreur lors de la conversion de la photo');
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError(null);
    if (!photoFile) {
      setError(t('payment.errors.noPhoto') || 'Photo du reçu requise');
      return;
    }
    if (!montant || isNaN(Number(montant))) {
      setError(t('forms.amount') || 'Montant requis');
      return;
    }
    if (!programNumber || programNumber.length !== 4 || !year || !month) {
      setError(t('payment.errors.programRequired') || 'Référence programme requise');
      return;
    }

    // Find declaration by components year/month/programNumber (may be undefined)
    const declaration = declarations.find(d => String(d.programNumber) === String(programNumber) && String(d.year) === String(year) && String(d.month) === String(month));

  setLoading(true);
  try { loadingCtx.show(t('forms.saving') || 'Enregistrement...'); } catch (e) {}
    try {
      // Upload photo and get URLs. If the upload server is unreachable, fall back to
      // saving the preview URL (dataURL or object URL) and mark the receipt as pending upload.
      let photoUrl = '';
      let uploadPending = false;
      try {
        const urls = await declarationService.uploadDeclarationPhotos([photoFile]);
        photoUrl = urls[0];
      } catch (uploadErr) {
        // Upload failed (e.g. local upload server down). Log and continue with a fallback.
        console.error('Upload failed, saving receipt locally with pending flag', uploadErr);
        photoUrl = previewUrl || '';
        uploadPending = true;
      }

      const newPayment = {
        photoUrl,
        year,
        month,
        programNumber,
        programReference: `DCP/${year}/${month}/${programNumber}`,
        companyId: companyId || null,
        companyName: companies.find(c => c.id === companyId)?.name || null,
        notes: notes || '',
        montant: Number(montant),
        status: 'validee',
        validatedAt: new Date().toISOString(),
        uploadPending: uploadPending,
        createdAt: new Date().toISOString(),
  createdBy: auth.user?.id || null,
  chauffeurId: declaration ? declaration.chauffeurId : null,
        declarationId: declaration ? declaration.id : null
      };

      // Add creator metadata and initial traceability
      // attach metadata
      (newPayment as any).createdBy = auth.user?.id || null;
      (newPayment as any).createdByName = auth.user?.fullName || null;
      (newPayment as any).traceability = [
        { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.paymentReceiptCreated'), date: new Date().toISOString() }
      ];

      // Persist as a top-level payment document
      const { addPayment } = await import('../services/paymentService');
      const paymentRef = await addPayment(newPayment);

      // If attached to a declaration, add traceability entry on declaration
      if (declaration) {
        const traceEntry = {
          userId: auth.user.id,
          userName: auth.user.fullName,
          action: t('traceability.paymentReceiptCreated'),
          date: new Date().toISOString()
        };
        // Update declaration traceability array (don't embed full receipt to avoid duplication)
        const updatedTrace = [...(declaration.traceability || []), traceEntry];
        await declarationService.updateDeclaration(declaration.id, { traceability: updatedTrace });
      }

      handleClose();
    } catch (err) {
      console.error(err);
      setError(t('payment.errors.saveFailed') || "Erreur lors de l'enregistrement");
    } finally {
      setLoading(false);
      try { loadingCtx.hide(); } catch (e) {}
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={val => { if (!val) handleClose(); }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{t('caissier.createPaymentTitle')}</DialogTitle>
            <DialogDescription>{t('caissier.createPaymentDesc')}</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>{t('forms.photo') || 'Photo'} *</Label>
              <div className="flex gap-2 items-center mt-2">
                <label htmlFor="create-payment-upload-gallery" className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition mr-2" title={t('forms.import') || 'Importer une photo'}>
                  +
                  <input
                    id="create-payment-upload-gallery"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                </label>

                {isMobile && (
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
                )}

                {previewUrl && (
                  <div className="ml-2">
                    <div className="relative w-16 h-16 border rounded overflow-hidden bg-muted">
                      <img src={previewUrl} alt="preview" className="object-cover w-full h-full" onError={e => (e.currentTarget.style.display = 'none')} />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* SimpleDeclarationNumberForm already renders its own label; avoid duplicate label */}
            <SimpleDeclarationNumberForm
              onNumberChange={(full) => setProgramNumber(full ? full.split('/').pop() || '' : '')}
              onComponentsChange={(y, m, pn) => { setYear(y); setMonth(m); setProgramNumber(pn); }}
              initialYear={year}
              initialMonth={month}
              initialProgramNumber={programNumber}
            />

            <div>
              <Label htmlFor="company">{t('companies.company') || t('companies.name') || 'Société'}</Label>
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
            </div>
            <div>
              <Label htmlFor="montant">{t('financial.amount') || t('forms.amount') || 'Montant (DZD)'}</Label>
              <Input id="montant" value={montant} onChange={e => setMontant(e.target.value)} placeholder="0" />
              <div className="mt-1">{typeof montant === 'string' && montant !== '' && !isNaN(Number(montant)) ? `${Number(montant).toFixed(2)} DZD` : ''}</div>
            </div>

            <div>
              <Label htmlFor="notes">{t('forms.notes') || 'Notes'}</Label>
              <Input id="notes" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>

            {error && <div className="text-red-600">{error}</div>}

            <div className="flex gap-2 pt-4">
              <Button type="submit" className="flex-1" disabled={loading}>
                {loading ? (t('buttons.saving') || 'Enregistrement...') : (t('forms.save') || 'Sauvegarder')}
              </Button>
              <Button type="button" variant="outline" onClick={handleClose}>
                {t('forms.cancel') || 'Annuler'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
      {/* Camera modal used for taking photo via device camera */}
      <CameraPreviewModal isOpen={cameraOpen} onPhotoTaken={handlePhotoTaken} onClose={() => setCameraOpen(false)} />
    </>
  );
};

export default CreatePaymentDialog;
