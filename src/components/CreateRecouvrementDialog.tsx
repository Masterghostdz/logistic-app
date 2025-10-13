import React, { useState, useEffect, useRef } from 'react';
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
import { useLoading } from '../contexts/LoadingContext';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogFooter, AlertDialogTitle, AlertDialogDescription, AlertDialogAction, AlertDialogCancel } from './ui/alert-dialog';
import { PaymentReceipt, Company, Chauffeur } from '../types';
import { getCompanies } from '../services/companyService';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

const CreateRecouvrementDialog: React.FC<Props> = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  const auth = useAuth();
  const { declarations, addDeclaration } = useSharedData();
  const loadingCtx = useLoading();

  const [programReference, setProgramReference] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [month, setMonth] = useState<string>('');
  const [programNumber, setProgramNumber] = useState<string>('');
  // Checkbox: this recouvrement doesn't relate to a program reference (DCP/NA/NA/NA)
  const [noProgramReference, setNoProgramReference] = useState<boolean>(false);
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
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [chauffeurSearch, setChauffeurSearch] = useState<string>('');
  const [selectedChauffeur, setSelectedChauffeur] = useState<Chauffeur | null>(null);
  const [showChauffeurAutocomplete, setShowChauffeurAutocomplete] = useState<boolean>(false);
  const chauffeurInputRef = useRef<HTMLInputElement | null>(null);
  const [dropdownRect, setDropdownRect] = useState<DOMRect | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const hookIsMobile = useIsMobile();
  const { settings } = useSettings();
  const isMobile = (settings?.viewMode === 'mobile') || hookIsMobile;
  // key to force remount of the SimpleDeclarationNumberForm when we need a full reset
  const [formKey, setFormKey] = useState<number>(0);
  // If a declaration already exists for the entered components, keep its id here
  const [existingDeclId, setExistingDeclId] = useState<string | null>(null);

  // Reset internal dialog state when the dialog opens so we don't keep a previous draftDeclId
  useEffect(() => {
    if (!isOpen) return;
    setProgramReference('');
    setYear('');
    setMonth('');
    setProgramNumber('');
    setNotes('');
    setDraftDeclId(null);
    setExistingDeclId(null);
    setSavingDraft(false);
    setLoading(false);
    setPhotoFile(null);
    setLocalPreviewUrl(null);
    setPreviewPhotoUrl(null);
    setAdding(false);
    setAddError(null);
    setPayments([]);
    setLocalAmounts({});
    setLocalCompany({});
    setValidatingIds({});
    setDeleteDialogOpen(false);
    setReceiptToDelete(null);
    setNoProgramReference(false);
    setChauffeurSearch('');
    setSelectedChauffeur(null);
    setShowChauffeurAutocomplete(false);
    // bump the formKey to ensure SimpleDeclarationNumberForm remounts for a full reset
    setFormKey(k => k + 1);
  }, [isOpen]);

  // detect if there is already a declaration matching the current inputs
  useEffect(() => {
    if (!declarations || declarations.length === 0) { setExistingDeclId(null); return; }
    if (noProgramReference) {
      // When user selects "Pas de référence programme" we must treat it as a new unknown
      // — do NOT consider any existing declaration that uses the NA sentinel as a match.
      // NA means unknown identity and should never be used to match/merge.
      setExistingDeclId(null);
      return;
    }
    if (!programNumber || programNumber.length !== 4) { setExistingDeclId(null); return; }
    const found = (declarations || []).find(d => String(d.programNumber) === String(programNumber) && String(d.year) === String(year) && String(d.month) === String(month));
    setExistingDeclId(found ? found.id : null);
    // If we found an existing declaration and it carries a chauffeurId, try to
    // auto-select that chauffeur (if present in the chauffeurs list). This
    // ensures when user types a reference for an existing declaration, the
    // chauffeur gets populated automatically.
    if (found && found.chauffeurId) {
      const ch = chauffeurs.find(c => String(c.id) === String(found.chauffeurId));
      if (ch) {
        setSelectedChauffeur(ch);
        // ensure input shows the display name
        setChauffeurSearch(chauffeurDisplayName(ch) || `${ch.firstName} ${ch.lastName}`);
      }
    }
  }, [declarations, programNumber, year, month, noProgramReference, chauffeurs]);

  // When an existing declaration id or a draft id is present, ensure the
  // chauffeur field is auto-filled from the declaration (useful when draft
  // was just created or when matching an existing declaration by reference).
  useEffect(() => {
    const id = existingDeclId || draftDeclId;
    if (!id) return;
    const decl = (declarations || []).find(d => d.id === id);
    if (decl && decl.chauffeurId) {
      const ch = chauffeurs.find(c => String(c.id) === String(decl.chauffeurId));
      if (ch) {
        setSelectedChauffeur(ch);
        setChauffeurSearch(chauffeurDisplayName(ch) || `${ch.firstName} ${ch.lastName}`);
      }
    }
  }, [existingDeclId, draftDeclId, chauffeurs, declarations]);

  const handleSend = async () => {
    if (!noProgramReference && (!programNumber || programNumber.length !== 4)) {
      toast({ title: t('declarations.programNumberRequired') || 'Numéro de programme requis', variant: 'destructive' });
      return;
    }
  setLoading(true);
  try { loadingCtx.show(t('forms.sending') || 'Envoi en cours...'); } catch (e) {}
    try {
      // find existing declaration matching components (year/month/programNumber) or sentinel when noProgramReference
      const existing = (!noProgramReference)
        ? (declarations || []).find(d => String(d.programNumber) === String(programNumber) && String(d.year) === String(year) && String(d.month) === String(month)) || (draftDeclId ? { id: draftDeclId } as any : null)
        : (declarations || []).find(d => String(d.programReference || '') === 'DCP/NA/NA/NA') || (draftDeclId ? { id: draftDeclId } as any : null);
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
          let toLink: any[] = [];
          if (noProgramReference) {
            toLink = (allPayments || []).filter((p: any) => String(p.programReference || '') === 'DCP/NA/NA/NA' && !p.declarationId);
          } else {
            toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
          }
          for (const p of toLink) {
            try { await updatePayment(p.id, { declarationId: existing.id }); } catch (err) { console.warn('linking payment failed', err); }
          }
        } catch (err) {
          // non-blocking
        }
      } else {
        // create new declaration already marked recouvrement
        const newDecl: any = {
          number: noProgramReference ? 'DCP/NA/NA/NA' : (programReference || `DCP/${year}/${month}/${programNumber}`),
          year: noProgramReference ? null : year,
          month: noProgramReference ? null : month,
          programNumber: noProgramReference ? null : programNumber,
          chauffeurId: selectedChauffeur ? selectedChauffeur.id : null,
          chauffeurName: chauffeurDisplayName(selectedChauffeur) || (selectedChauffeur ? `${selectedChauffeur.firstName} ${selectedChauffeur.lastName}` : null),
          status: '',
          notes: notes || '',
          createdAt: new Date().toISOString(),
          paymentState: 'recouvre',
          paymentRecoveredAt: new Date().toISOString(),
          programReference: noProgramReference ? 'DCP/NA/NA/NA' : (programReference || `DCP/${year}/${month}/${programNumber}`),
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
            let toLink: any[] = [];
            if (noProgramReference) {
              toLink = (allPayments || []).filter((p: any) => String(p.programReference || '') === 'DCP/NA/NA/NA' && !p.declarationId);
            } else {
              toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
            }
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
      try { loadingCtx.hide(); } catch (e) {}
    }
  };

  const handleSaveDraft = async () => {
    if (!noProgramReference && (!programNumber || programNumber.length !== 4)) {
      toast({ title: t('declarations.programNumberRequired') || 'Numéro de programme requis', variant: 'destructive' });
      return;
    }
  setSavingDraft(true);
  try { loadingCtx.show(t('forms.saving') || 'Enregistrement...'); } catch (e) {}
    try {
      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.createdDraft') || 'Déclaration brouillon créée', date: new Date().toISOString() };
      const newDecl: any = {
        number: noProgramReference ? 'DCP/NA/NA/NA' : (programReference || `DCP/${year}/${month}/${programNumber}`),
        year: noProgramReference ? null : year,
        month: noProgramReference ? null : month,
        programNumber: noProgramReference ? null : programNumber,
  chauffeurId: selectedChauffeur ? selectedChauffeur.id : null,
  chauffeurName: chauffeurDisplayName(selectedChauffeur) || (selectedChauffeur ? `${selectedChauffeur.firstName} ${selectedChauffeur.lastName}` : null),
        status: 'brouillon',
        notes: notes || '',
        createdAt: new Date().toISOString(),
        paymentState: 'brouillon',
        programReference: noProgramReference ? 'DCP/NA/NA/NA' : (programReference || `DCP/${year}/${month}/${programNumber}`),
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
          let toLink: any[] = [];
          if (noProgramReference) {
            toLink = (allPayments || []).filter((p: any) => String(p.programReference || '') === 'DCP/NA/NA/NA' && !p.declarationId);
          } else {
            toLink = (allPayments || []).filter((p: any) => String(p.programNumber) === String(programNumber) && String(p.year) === String(year) && String(p.month) === String(month) && !p.declarationId);
          }
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
      try { loadingCtx.hide(); } catch (e) {}
    }
  };

  const handleCancelRecouvrement = async () => {
    // if there's an existing declaration marked recouvre, allow revoking it from the dialog
    if (!existingDeclId) return;
    try {
      setLoading(true);
      try { loadingCtx.show(t('recouvrement.revoking') || 'Annulation en cours...'); } catch (e) {}
      const decl = (declarations || []).find(d => d.id === existingDeclId);
      if (!decl) {
        toast({ title: t('forms.error') || 'Erreur', description: t('declarations.notFound') || 'Déclaration introuvable', variant: 'destructive' });
        return;
      }
      const { updateDeclaration } = await import('../services/declarationService');
      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.revokedRecouvrement') || 'Annulation recouvrement', date: new Date().toISOString() };
      await updateDeclaration(existingDeclId, { paymentState: '', paymentRecoveredAt: null }, traceEntry);
      toast({ title: t('recouvrement.revoked') || (t('traceability.revokedRecouvrement') || 'Annulation recouvrement') });
      onClose();
    } catch (e: any) {
      console.error('Cancel recouvrement failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de l\'opération'), variant: 'destructive' });
    } finally {
      setLoading(false);
      try { loadingCtx.hide(); } catch (e) {}
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
          let filtered: any[] = [];
          if (noProgramReference) {
            // If the user chose "noProgramReference" we must NOT surface arbitrary receipts
            // that were saved with the NA sentinel. NA is an unknown identity and should be
            // considered as new. Only show payments already explicitly attached to the
            // current draft declaration (if any). Otherwise show none.
            if (draftDeclId) {
              filtered = (all || []).filter((p: any) => String(p.declarationId || '') === String(draftDeclId));
            } else {
              // No draft => don't show any receipts for NA
              setPayments([]);
              return;
            }
          } else {
            if (!programNumber) {
              setPayments([]);
              return;
            }
            filtered = (all || []).filter((p: any) => String(p.programNumber || '') === String(programNumber || '') && String(p.year || '') === String(year || '') && String(p.month || '') === String(month || ''));
          }
          setPayments(filtered as PaymentReceipt[]);
        });
      } catch (e) {
        // fallback: load once
        try {
          const { getPayments } = await import('../services/paymentService');
          const all = await getPayments();
          let filtered: any[] = [];
          if (noProgramReference) {
            if (draftDeclId) {
              filtered = (all || []).filter((p: any) => String(p.declarationId || '') === String(draftDeclId));
            } else {
              setPayments([]);
              return;
            }
          } else {
            filtered = (all || []).filter((p: any) => String(p.programNumber || '') === String(programNumber || '') && String(p.year || '') === String(year || '') && String(p.month || '') === String(month || ''));
          }
          setPayments(filtered as PaymentReceipt[]);
        } catch (err) {
          console.warn('Failed to load payments', err);
        }
      }
    };
    listen();
    return () => { if (unsub) unsub(); };
  }, [programNumber, year, month, noProgramReference, draftDeclId]);

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

  // Compute whether the declaration currently targeted is already marked 'recouvre'
  const currentDecl = (declarations || []).find(d => d.id === (existingDeclId || draftDeclId));
  const declPaymentState = String((currentDecl as any)?.paymentState || '').toLowerCase();
  const isRecouvre = declPaymentState.startsWith('recouv');
  // Enable 'Envoyer' only when there is at least one payment and all are validated
  const allValidated = payments.length > 0 && payments.every(p => ['validee', 'validated', 'valide', 'valid'].includes(String(p.status || '').toLowerCase()));

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
      try { loadingCtx.show(t('forms.deleting') || 'Suppression...'); } catch (e) {}
      const { safeDeletePayment } = await import('../services/paymentService');
      await safeDeletePayment(receiptToDelete, auth.user);
      toast({ title: t('payments.deleted') || 'Reçu supprimé' });
    } catch (e: any) {
      console.error('Delete failed', e);
      toast({ title: e?.message || (t('forms.error') || 'Erreur lors de la suppression'), variant: 'destructive' });
    } finally {
      setDeleteDialogOpen(false);
      setReceiptToDelete(null);
      try { loadingCtx.hide(); } catch (e) {}
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
      try { loadingCtx.show(t('payments.validating') || 'Validation en cours...'); } catch (e) {}
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
      try { loadingCtx.hide(); } catch (e) {}
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
      try { loadingCtx.show(t('forms.saving') || 'Enregistrement...'); } catch (e) {}
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
        year: noProgramReference ? null : (year || null),
        month: noProgramReference ? null : (month || null),
        programNumber: noProgramReference ? null : (programNumber || null),
        programReference: noProgramReference ? 'DCP/NA/NA/NA' : (programReference || `DCP/${year}/${month}/${programNumber}`) || null,
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
      try { loadingCtx.hide(); } catch (e) {}
    }
  };

  // Chauffeur selector: listen chauffeurs
  useEffect(() => {
    let unsub: any;
    (async () => {
      try {
        const { listenChauffeurs } = await import('../services/chauffeurService');
        unsub = listenChauffeurs((list: any[]) => setChauffeurs(list as Chauffeur[]));
      } catch (e) {
        try {
          const { getChauffeurs } = await import('../services/chauffeurService');
          const list = await getChauffeurs();
          setChauffeurs(list as Chauffeur[]);
        } catch (err) {
          console.warn('Failed to load chauffeurs', err);
        }
      }
    })();
    return () => { if (unsub) unsub(); };
  }, []);

  // update dropdown rect on resize/scroll while the dropdown is open
  useEffect(() => {
    if (!showChauffeurAutocomplete) return;
    const update = () => {
      if (chauffeurInputRef.current) setDropdownRect(chauffeurInputRef.current.getBoundingClientRect());
    };
    update();
    window.addEventListener('resize', update);
    window.addEventListener('scroll', update, true);
    return () => {
      window.removeEventListener('resize', update);
      window.removeEventListener('scroll', update, true);
    };
  }, [showChauffeurAutocomplete]);

  // Close dropdown when clicking outside input or the dropdown itself
  useEffect(() => {
    if (!showChauffeurAutocomplete) return;
    const handler = (e: PointerEvent) => {
      try {
        const path = (e as any).composedPath ? (e as any).composedPath() : ((e as any).path || []);
        // If composedPath includes input or dropdown, keep open
        if (path && path.length) {
          for (const el of path) {
            if (el === chauffeurInputRef.current) return;
            if (el === dropdownRef.current) return;
          }
        }
        // Fallback: use contains checks
        const target = e.target as Node | null;
        if (chauffeurInputRef.current && target && chauffeurInputRef.current.contains(target)) return;
        if (dropdownRef.current && target && dropdownRef.current.contains(target)) return;
        if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
          console.debug('closing chauffeur dropdown due to outside pointerdown', { target });
        }
        setShowChauffeurAutocomplete(false);
      } catch (err) {
        setShowChauffeurAutocomplete(false);
      }
    };
  // listen in bubble phase (not capture) so dropdown item handlers can stopPropagation()
  // which prevents the document handler from closing the dropdown before the
  // item's own pointerdown runs. Using capture caused a race in some environments.
  document.addEventListener('pointerdown', handler, false);
  return () => document.removeEventListener('pointerdown', handler, false as any);
  }, [showChauffeurAutocomplete]);

  // Chauffeur selector: filtered chauffeurs for autocomplete
  const filteredChauffeurs = React.useMemo(() => {
    if (!chauffeurSearch) return chauffeurs;
    const s = chauffeurSearch.toLowerCase();
    return chauffeurs.filter(c => {
      const full = `${c.firstName || ''} ${c.lastName || ''}`.toLowerCase();
      return full.includes(s) || (c.username || '').toLowerCase().includes(s) || (c.phone || []).join(' ').toLowerCase().includes(s);
    });
  }, [chauffeurSearch, chauffeurs]);

  // Helper to compute the display name (adds TP - prefix for externes).
  // Ensure the TP prefix is only applied for chauffeurs (role === 'chauffeur').
  // Some passenger/user objects may include employeeType but are not chauffeurs,
  // so if a role property exists we require it to be 'chauffeur' to show the prefix.
  const chauffeurDisplayName = (c: Chauffeur | null) => {
    if (!c) return null;
    // If the object carries an explicit role, only prefix when it's a chauffeur.
    const explicitRole = (c as any).role as string | undefined;
    const isChauffeurRole = explicitRole ? explicitRole === 'chauffeur' : true; // fallback: assume this is a Chauffeur entity
    const isExterne = (c.employeeType === 'externe' || (c.employeeType || '').toLowerCase() === 'externe');
    const prefix = (isChauffeurRole && isExterne) ? (t('chauffeurs.tpPrefix') || 'TP - ') : '';
    return `${prefix}${c.firstName || ''} ${c.lastName || ''}`.trim();
  };

  const dialogClass = isMobile ? 'max-w-md' : 'max-w-3xl mx-4';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={dialogClass}>
        <DialogHeader>
          <DialogTitle>{t('caissier.createRecouvrement') || 'Créer Recouvrement'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            {/* Label placed above the DCP/... controls and outside the colored band */}
            <Label className="mb-2 block">{t('declarations.programNumber') || 'Numéro de programme'}</Label>
            {/* Outer wrapper identical to consultation dialog: full-width colored box */}
            <div className="p-3 bg-gray-50 rounded-md border flex items-center justify-between gap-4">
              <div className="flex-1">
                {/* Keep the exact SimpleDeclarationNumberForm layout for both cases.
                    When noProgramReference is true we prefill the components with 'NA' and set readOnly to true */}
                <SimpleDeclarationNumberForm
                  key={formKey}
                   onNumberChange={(num) => setProgramReference(num)}
                   onComponentsChange={(y, m, pn) => { setYear(y); setMonth(m); setProgramNumber(pn); }}
                   initialYear={noProgramReference ? 'NA' : ''}
                   initialMonth={noProgramReference ? 'NA' : ''}
                   initialProgramNumber={noProgramReference ? 'NA' : ''}
                   readOnly={noProgramReference}
                   noWrapper={true}
                 />
              </div>
              <div className="flex items-center ml-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <span className="text-sm text-black">{t('recouvrement.noProgramReference') || 'Pas de référence programme (DCP/NA/NA/NA)'}</span>
                  <input
                    type="checkbox"
                    className="accent-primary w-5 h-5 ml-3"
                    checked={noProgramReference}
                    onChange={(e) => {
                      const checked = !!e.target.checked;
                      setNoProgramReference(checked);
                      // bump formKey to force the SimpleDeclarationNumberForm to remount and fully reset its internal state
                      setFormKey(k => k + 1);
                      if (checked) {
                        // Prefill components with NA and keep the same program reference format
                        setProgramReference('DCP/NA/NA/NA');
                        setYear('NA'); setMonth('NA'); setProgramNumber('NA');
                      } else {
                        // reset component fields to empty so SimpleDeclarationNumberForm will revert to defaults
                        setProgramReference('');
                        setYear(''); setMonth(''); setProgramNumber('');
                      }
                    }}
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Photo upload / camera controls are rendered below receipts when a declaration exists or a draft was created (see below) */}
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
                      const actionsDisabled = !!isRecouvre; // disable per-payment actions when declaration is recouvré
                      return (
                        <>
                          {isPending && (
                            <>
                              <button title={t('payments.confirmDeleteReceipt') || 'Confirmez-vous la suppression de ce reçu ?'} onClick={() => handleDeleteRequest(r.id)} className="p-2 rounded border border-border text-red-600 hover:bg-red-50 dark:hover:bg-red-900" disabled={actionsDisabled}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V5a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
                              </button>
                              <button title={t('payments.validate') || 'Valider'} onClick={() => handleValidate(r)} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900" disabled={actionsDisabled || !!validatingIds[r.id]}>
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
                            }} className="p-2 rounded border border-border text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900" disabled={actionsDisabled}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 12a9 9 0 10-9 9" />
                                <path d="M21 3v9h-9" />
                              </svg>
                            </button>
                          )}
                          {!isValidated && !isPending && (
                            <button title={t('payments.validate') || 'Valider'} onClick={() => handleValidate(r)} className="p-2 rounded border border-border text-green-600 hover:bg-green-50 dark:hover:bg-green-900" disabled={actionsDisabled || !!validatingIds[r.id]}>
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
          {/* When a declaration (existing or draft) is present, show import/camera controls below the receipts
              Desktop: only import
              Mobile: import + camera */}
          {(existingDeclId || draftDeclId) && (
            <div className="flex items-center gap-2 pt-2">
              <label htmlFor="recouv-upload-gallery" className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition" title={t('forms.import') || 'Importer une photo'}>
                +
                <input id="recouv-upload-gallery" type="file" accept="image/*" className="hidden" onChange={handleFileInputChange} />
              </label>
              {isMobile && (
                <button type="button" onClick={() => setCameraOpen(true)} className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition" title={t('buttons.camera') || 'Prendre une photo'}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white"><rect x="3" y="7" width="18" height="13" rx="2" stroke="white" strokeWidth="2" fill="none" /><circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="2" fill="none" /><rect x="8" y="3" width="8" height="4" rx="1" stroke="white" strokeWidth="2" fill="none" /></svg>
                </button>
              )}
              {localPreviewUrl && (
                <div className="ml-2">
                  <div className="relative w-16 h-16 border rounded overflow-hidden bg-muted">
                    <img src={localPreviewUrl} alt="preview" className="object-cover w-full h-full" onError={(e:any) => (e.currentTarget.style.display = 'none')} />
                  </div>
                </div>
              )}
              {addError && <div className="text-red-600 text-sm ml-2">{addError}</div>}
            </div>
          )}
          <div>
            <Label htmlFor="recouv-notes">{t('forms.notes') || 'Notes'}</Label>
            <Input id="recouv-notes" value={notes} onChange={(e) => setNotes(e.target.value)} />
          </div>
          {/* Chauffeur selector (real-time listener + autocomplete) */}
          <div>
            <Label htmlFor="chauffeur-search">{t('chauffeurs.select') || 'Sélectionner un chauffeur'}</Label>
            <div className="relative">
              <Input
                id="chauffeur-search"
                ref={chauffeurInputRef as any}
                value={chauffeurSearch}
                onChange={(e) => setChauffeurSearch(e.target.value)}
                onFocus={() => {
                  // don't open autocomplete when field is readonly (after save / existing decl)
                  const isChauffeurReadonly = !!(existingDeclId || draftDeclId);
                  if (isChauffeurReadonly) return;
                  setShowChauffeurAutocomplete(true);
                  // update position immediately
                  if (chauffeurInputRef.current) setDropdownRect(chauffeurInputRef.current.getBoundingClientRect());
                }}
                onBlur={() => {
                  // Do not auto-close on blur; we rely on the document mousedown handler
                  // which properly handles clicks into the portal dropdown. This avoids
                  // race conditions where blur fires before the dropdown's mousedown.
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setShowChauffeurAutocomplete(false);
                  }
                }}
                placeholder={t('chauffeurs.search') || 'Rechercher par nom, prénom, téléphone...'}
                className="pr-10"
                // make readonly when a declaration/draft exists
                readOnly={!!(existingDeclId || draftDeclId)}
                disabled={!!(existingDeclId || draftDeclId)}
              />
              {/* Render the dropdown in a portal so it can overflow the dialog and adapt to dark mode */}
              {showChauffeurAutocomplete && filteredChauffeurs.length > 0 && dropdownRect && !(existingDeclId || draftDeclId) && createPortal(
                <div
                  ref={dropdownRef}
                  style={{ top: dropdownRect.top + dropdownRect.height + window.scrollY, left: dropdownRect.left + window.scrollX, width: dropdownRect.width, position: 'fixed' as const }}
                  className="fixed z-[99999] rounded-md shadow-lg max-h-60 overflow-auto border bg-card dark:bg-muted border-border dark:border-slate-700 pointer-events-auto"
                >
                  {filteredChauffeurs.map(chauffeur => (
                    <div
                      key={chauffeur.id}
                      role="option"
                      tabIndex={0}
                      aria-selected={selectedChauffeur?.id === chauffeur.id}
                      className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-slate-700 text-foreground dark:text-white"
                      onPointerDown={(e) => {
                        // prevent input blur race conditions and stop document handler
                        e.preventDefault();
                        e.stopPropagation();
                        setSelectedChauffeur(chauffeur);
                        setChauffeurSearch(chauffeurDisplayName(chauffeur) || `${chauffeur.firstName} ${chauffeur.lastName}`);
                        setShowChauffeurAutocomplete(false);
                        // ensure input reflects the new value
                        setTimeout(() => { try { chauffeurInputRef.current?.focus(); } catch (e) {} }, 0);
                      }}
                      onClick={(e) => {
                        // fallback for environments that don't support pointer events
                        e.stopPropagation();
                        setSelectedChauffeur(chauffeur);
                        setChauffeurSearch(chauffeurDisplayName(chauffeur) || `${chauffeur.firstName} ${chauffeur.lastName}`);
                        setShowChauffeurAutocomplete(false);
                        try { chauffeurInputRef.current?.focus(); } catch (e) {}
                      }}
                    >
                      {/* display only the chauffeur display name as requested */}
                      <div className="font-medium text-sm md:text-base">{chauffeurDisplayName(chauffeur)}</div>
                    </div>
                  ))}
                </div>,
                document.body
              )}
            </div>
          </div>
          <div className="flex gap-2 pt-2 justify-end">
            <Button variant="outline" onClick={onClose}>{t('forms.cancel') || 'Annuler'}</Button>
            {/* If an existing declaration or a draft exists, show 'Envoyer' to avoid creating duplicates; otherwise show 'Enregistrer' */}
            {!(existingDeclId || draftDeclId) ? (
              <Button
                onClick={handleSaveDraft}
                disabled={
                  savingDraft ||
                  (!noProgramReference && !(programNumber && programNumber.length === 4)) ||
                  // require a chauffeur to be selected before allowing save
                  !selectedChauffeur
                }
              >
                {savingDraft ? (t('forms.saving') || 'Enregistrement...') : (t('forms.save') || 'Enregistrer')}
              </Button>
            ) : (
              (() => {
                // If the existing declaration has been marked recouvré, offer Annuler (revoke) instead of Envoyer
                const existingDecl = (declarations || []).find(d => d.id === (existingDeclId || draftDeclId));
                const declPaymentState = String((existingDecl as any)?.paymentState || '').toLowerCase();
                const isRecouvre = declPaymentState.startsWith('recouv');
                if (isRecouvre) {
                  // Filled orange 'Retourner' button — same shape as Envoyer but orange + contour
                  return (
                    <Button
                      onClick={handleCancelRecouvrement}
                      disabled={loading}
                      className={`bg-yellow-600 text-white border border-yellow-700 flex items-center gap-2 ${loading ? 'opacity-50 pointer-events-none' : ''}`}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 12a9 9 0 10-9 9" />
                        <path d="M21 3v9h-9" />
                      </svg>
                      <span>{t('recouvrement.return') || 'Retourner'}</span>
                    </Button>
                  );
                }
                // Green filled 'Envoyer' button with send icon (same as SendReceiptsDialog)
                return (
                  <Button
                    onClick={handleSend}
                    disabled={loading || !allValidated}
                    className={`bg-green-600 text-white flex items-center gap-2 ${(loading || !allValidated) ? 'opacity-50 pointer-events-none' : ''}`}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                      <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 5z" />
                    </svg>
                    <span>{t('payments.send') || 'Envoyer'}</span>
                  </Button>
                );
              })()
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
