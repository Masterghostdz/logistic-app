import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { useTranslation } from '../hooks/useTranslation';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';
import CameraPreviewModal from './CameraPreviewModal';
import { useAuth } from '../contexts/AuthContext';
import { useSharedData } from '../contexts/SharedDataContext';
import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';
import { toast } from './ui/use-toast';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './ui/alert-dialog';
import { PaymentReceipt, Company } from '../types';
import { getCompanies } from '../services/companyService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRecouvrementDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { declarations, addDeclaration } = useSharedData();

  const [programReference, setProgramReference] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [programNumber, setProgramNumber] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [draftDeclId, setDraftDeclId] = useState<string | null>(null);
  const [savingDraft, setSavingDraft] = useState(false);
  // Photo-first controls
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState<string | null>(null);
  // payments listing and form state (to match SendReceiptsDialog behavior)
  const [payments, setPayments] = useState<PaymentReceipt[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [localAmounts, setLocalAmounts] = useState<Record<string, number>>({});
  const [localCompany, setLocalCompany] = useState<Record<string, string>>({});
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  const [validatingIds, setValidatingIds] = useState<Record<string, boolean>>({});
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [receiptToDelete, setReceiptToDelete] = useState<string | null>(null);
  const hookIsMobile = useIsMobile();
  const { settings } = useSettings();
  const isMobile = (settings?.viewMode === 'mobile') || hookIsMobile;

  const handleSend = async () => {
    if (!programNumber || programNumber.length !== 4) {
      toast({ title: t('declarations.programNumberRequired') || 'Numéro de programme requis', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      // find existing declaration matching components (year/month/programNumber)
      const existing = (declarations || []).find(d => String(d.programNumber) === String(programNumber) && String(d.year) === String(year) && String(d.month) === String(month)) || (draftDeclId ? { id: draftDeclId } as any : null);
      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.sentReceipts') || 'Recouvrement créé', date: new Date().toISOString() };

      if (existing) {
        // mark existing as recouvre
        const { updateDeclaration } = await import('../services/declarationService');
        await updateDeclaration(existing.id, { paymentState: 'recouvre', paymentRecoveredAt: new Date().toISOString() }, traceEntry);
        toast({ title: t('declarations.recovered') || 'Déclaration marquée Recouvré' });
        // link any locally added payments (without declarationId) that match the program reference
        try {
          const { getPayments, updatePayment } = await import('../services/paymentService');
          const allPayments = await getPayments();
          const toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
          for (const p of toLink) {
            try { await updatePayment(p.id, { declarationId: existing.id }); } catch (err) { console.warn('linking payment failed', err); }
          }
        } catch (err) {
          // non-blocking
        }
      } else {
        // create new declaration already marked recouvrement
        const newDecl: any = {
          number: programReference || `DCP/${year}/${month}/${programNumber}`,
          year,
          month,
          programNumber,
          chauffeurId: null,
          chauffeurName: null,
          status: '',
          notes: notes || '',
          createdAt: new Date().toISOString(),
          paymentState: 'recouvre',
          paymentRecoveredAt: new Date().toISOString(),
          programReference: programReference || `DCP/${year}/${month}/${programNumber}`,
          traceability: [traceEntry]
        };
        const docRef = await addDeclaration(newDecl);
        if (docRef && (docRef as any).id) {
          const declId = (docRef as any).id;
          const { updateDeclaration } = await import('../services/declarationService');
          await updateDeclaration(declId, { id: declId }, traceEntry);
          // link any locally added payments to this declaration
          try {
            const { getPayments, updatePayment } = await import('../services/paymentService');
            const allPayments = await getPayments();
            const toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
            for (const p of toLink) {
              try { await updatePayment(p.id, { declarationId: declId }); } catch (err) { console.warn('linking payment failed', err); }
            }
          } catch (err) {
            // ignore
          }
        }
        toast({ title: t('declarations.recovered') || 'Déclaration créée et marquée Recouvré' });
      }

      onClose();
    } catch (e: any) {
      console.error('Create recouvrement failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'opération'), variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    if (!programNumber || programNumber.length !== 4) {
      toast({ title: t('declarations.programNumberRequired') || 'Numéro de programme requis', variant: 'destructive' });
      return;
    }
    setSavingDraft(true);
    try {
      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.createdDraft') || 'Déclaration brouillon créée', date: new Date().toISOString() };
      const newDecl: any = {
        number: programReference || `DCP/${year}/${month}/${programNumber}`,
        year,
        month,
        programNumber,
        chauffeurId: null,
        chauffeurName: null,
        status: 'brouillon',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        paymentState: 'brouillon',
        programReference: programReference || `DCP/${year}/${month}/${programNumber}`,
        traceability: [traceEntry]
      };
      const docRef = await addDeclaration(newDecl);
      const declId = typeof docRef === 'string' ? docRef : (docRef as any).id;
      if (declId) {
        setDraftDeclId(declId as string);
        // ensure declared id is set in firestore doc
        try {
          const { updateDeclaration } = await import('../services/declarationService');
          await updateDeclaration(declId, { id: declId }, traceEntry);
        } catch (e) {
          // non-blocking
        }
        // link any payments that match the program and have no declarationId
        try {
          const { getPayments, updatePayment } = await import('../services/paymentService');
          const allPayments = await getPayments();
          const toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
          for (const p of toLink) {
            try { await updatePayment(p.id, { declarationId: declId }); } catch (err) { console.warn('linking payment failed', err); }
          }
        } catch (err) {
          // ignore
        }
        toast({ title: t('declarations.saved') || 'Déclaration enregistrée (brouillon)' });
      }
    } catch (e: any) {
      console.error('Save draft failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'enregistrement'), variant: 'destructive' });
    } finally {
      setSavingDraft(false);
    }
  };

  // --- photo-first helpers (similar to SendReceiptsDialog) ---
  React.useEffect(() => {
    if (!photoFile) { setLocalPreviewUrl(null); return; }
    const url = typeof photoFile === 'string' ? photoFile : URL.createObjectURL(photoFile);
    setLocalPreviewUrl(url);
    return () => { if (typeof photoFile !== 'string') URL.revokeObjectURL(url); };
  }, [photoFile]);

  // load companies (for company select) similar to SendReceiptsDialog
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

  // listen payments and filter by program components when set
  useEffect(() => {
    let unsub: any;
    const listen = async () => {
      try {
        const { listenPayments } = await import('../services/paymentService');
        unsub = listenPayments((all: any[]) => {
          if (!programNumber) {
            setPayments([]);
            return;
          }
            const filtered = (all || []).filter((p: any) => String(p.programNumber || '') === String(programNumber || '') && String(p.year || '') === String(year || '') && String(p.month || '') === String(month || ''));
            setPayments(filtered as PaymentReceipt[]);
        });
      } catch (e) {
        // fallback: load once
        try {
          const { getPayments } = await import('../services/paymentService');
          const all = await getPayments();
            const filtered = (all || []).filter((p: any) => String(p.programNumber || '') === String(programNumber || '') && String(p.year || '') === String(year || '') && String(p.month || '') === String(month || ''));
            setPayments(filtered as PaymentReceipt[]);
        } catch (err) {
          console.warn('Failed to load payments', err);
        }
      }
    };
    listen();
    return () => { if (unsub) unsub(); };
  }, [programNumber, year, month]);

  useEffect(() => {
    const amounts: Record<string, number> = {};
    const comps: Record<string, string> = {};
    for (const r of payments) {
      if (typeof r.montant === 'number') amounts[r.id] = r.montant as number;
      if (r.companyId) comps[r.id] = r.companyId;
    }
    setLocalAmounts(amounts);
    setLocalCompany(comps);
  }, [payments]);

  const handleAmountChange = (id: string, val: string) => {
    const num = parseFloat(val || '0') || 0;
    setLocalAmounts(prev => ({ ...prev, [id]: num }));
  };

  const handleCompanyChange = (id: string, compId: string) => {
    setLocalCompany(prev => ({ ...prev, [id]: compId }));
  };

  const handleDeleteRequest = (id: string) => {
    setReceiptToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!receiptToDelete) return;
    try {
      const { safeDeletePayment } = await import('../services/paymentService');
      await safeDeletePayment(receiptToDelete, auth.user);
      toast({ title: t('payments.deleted') || 'Reçu supprimé' });
    } catch (e: any) {
      console.error('Delete failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de la suppression'), variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setReceiptToDelete(null);
    }
  };

  const handleValidate = async (r: PaymentReceipt) => {
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
      const { updatePayment, getPayments } = await import('../services/paymentService');
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
      toast({ title: t('payments.validated') || 'Reçu validé' });
    } catch (e: any) {
      console.error('Validation failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'opération'), variant: 'destructive' });
    } finally {
      setValidatingIds(prev => ({ ...prev, [r.id]: false }));
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files && e.target.files[0];
    if (f) { setPhotoFile(f); void handleAddPhotoFile(f); }
  };

  const handlePhotoTaken = async (dataUrl: string) => {
    try {
      setLocalPreviewUrl(dataUrl);
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
        const { uploadDeclarationPhotos } = await import('../services/declarationService');
        const urls = await uploadDeclarationPhotos([file]);
        photoUrl = urls[0];
      } catch (uploadErr) {
        console.error('Upload failed, saving receipt locally', uploadErr);
        photoUrl = fallbackDataUrl || localPreviewUrl || '';
        uploadPending = true;
      }

      const newPayment: any = {
        photoUrl,
        year: year || null,
        month: month || null,
        programNumber: programNumber || null,
        programReference: programReference || `DCP/${year}/${month}/${programNumber}` || null,
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
        declarationId: draftDeclId || null, // attach to draft if exists
        traceability: [{ userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.paymentReceiptCreated') || 'Reçu créé', date: new Date().toISOString() }]
      };

      const { addPayment } = await import('../services/paymentService');
      await addPayment(newPayment);
      // parent payments listener will pick up the new payment and we'll link it when sending/creating declaration
    } catch (e: any) {
      console.error('Failed to add payment', e);
      setAddError(e?.message || (t('payment.errors.saveFailed') || 'Erreur lors de l\'enregistrement'));
    } finally {
      setAdding(false);
      setPhotoFile(null);
    }
  };

  const dialogClass = isMobile ? 'max-w-md' : 'max-w-3xl mx-4';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>{t('caissier.createRecouvrement') || 'Créer Recouvrement'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SimpleDeclarationNumberForm
            onNumberChange={(num) => setProgramReference(num)}
            onComponentsChange={(y, m, pn) => { setYear(y); setMonth(m); setProgramNumber(pn); }}
          />

          {/* Photo-first upload controls (appear only after draft is saved) */}
          {draftDeclId ? (
            <div className="flex items-center gap-2">
              <label htmlFor="recouv-upload-gallery" className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition" title={t('forms.import') || 'Importer une photo'}>
                +
                <input id="recouv-upload-gallery" type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
              </label>
              <button type="button" onClick={() => setCameraOpen(true)} className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition" title={t('buttons.camera') || 'Prendre une photo'}>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white"><rect x="3" y="7" width="18" height="13" rx="2" stroke="white" strokeWidth="2" fill="none" /><circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="2" fill="none" /><rect x="8" y="3" width="8" height="4" rx="1" stroke="white" strokeWidth="2" fill="none" /></svg>
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
          ) : null}
          {payments.length === 0 ? (
            <div className="text-muted-foreground">{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</div>
          ) : (
            <div className="space-y-2">
              {payments.map((r) => (
                <div key={r.id} className="border rounded-lg p-3 bg-card dark:bg-muted flex items-center gap-3">
                  <div className="w-28 flex-shrink-0">
                    <button type="button" onClick={() => setPreviewPhotoUrl(r.photoUrl)} className="block p-0 m-0 w-full h-20 overflow-hidden rounded-md border">
                      <img src={r.photoUrl} alt={`recu-${r.id}`} className="object-cover w-full h-full" onError={(e:any) => (e.currentTarget.style.display = 'none')} />
                    </button>
                  </div>
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
                  <div className={`ml-auto flex gap-2`}>
                    {(() => {
                      const st = String(r.status || '').toLowerCase();
                      const isPending = ['brouillon', 'pending'].includes(st);
                      const isValidated = ['validee', 'validated', 'valide', 'valid'].includes(st);
                      return (
                        <>
                          {isPending && (
                            <>
                              <button title={t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'} onClick={() => handleDeleteRequest(r.id)} className="p-2 rounded border border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-900">
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              </button>
                              <button title={t('payments.validate') || 'Valider'} onClick={() => handleValidate(r)} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900" disabled={!!validatingIds[r.id]}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/></svg>
                              </button>
                            </>
                          )}
                          {isValidated && (
                            <button title={t('payments.undo') || 'Annuler'} onClick={async () => {
                              try {
                                const { updatePayment } = await import('../services/paymentService');
                                await updatePayment(r.id, { status: 'brouillon' });
                                toast({ title: t('payments.undone') || 'Statut annulé' });
                              } catch (e) {
                                console.error('Undo failed', e);
                                toast({ title: t('forms.error') || 'Erreur lors de l\'opération', variant: 'destructive' });
                              }
                            }} className="p-2 rounded border border-border text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900">
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 10-9 9" />
                                <path d="M21 3v9h-9" />
                              </svg>
                            </button>
                          )}
                          {!isValidated && !isPending && (
                            <button title={t('payments.validate') || 'Valider'} onClick={() => handleValidate(r)} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900" disabled={!!validatingIds[r.id]}>
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
          <div>
            <Label htmlFor="recouv-notes">{t('forms.notes') || 'Notes'}</Label>
            <Input id="recouv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="outline" onClick={onClose}>{t('forms.cancel') || 'Annuler'}</Button>
            {!draftDeclId ? (
              <Button onClick={handleSaveDraft} disabled={savingDraft || !(programNumber && programNumber.length === 4)}>{savingDraft ? (t('forms.saving') || 'Enregistrement...') : (t('forms.save') || 'Enregistrer')}</Button>
            ) : (
              <Button onClick={handleSend} disabled={loading}>{t('payments.send') || 'Envoyer'}</Button>
            )}
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
        {/* Camera modal */}
        <CameraPreviewModal isOpen={cameraOpen} onPhotoTaken={handlePhotoTaken} onClose={() => setCameraOpen(false)} />

        <AlertDialog open={deleteDialogOpen} onOpenChange={(open) => { setDeleteDialogOpen(open); if (!open) setReceiptToDelete(null); }}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('payments.confirmDeleteTitle') || 'Supprimer le reçu'}</AlertDialogTitle>
              <AlertDialogDescription>{t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-0" onClick={() => { setDeleteDialogOpen(false); setReceiptToDelete(null); }}>{t('forms.cancel') || 'Annuler'}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDelete}>{t('forms.confirm') || 'Supprimer'}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRecouvrementDialog;
