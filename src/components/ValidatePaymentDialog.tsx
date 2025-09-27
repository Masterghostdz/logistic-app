import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';
import { useSharedData } from '../contexts/SharedDataContext';
import { useAuth } from '../contexts/AuthContext';

interface ValidatePaymentDialogProps {
  receipt: any | null;
  isOpen: boolean;
  onClose: () => void;
  onValidated?: (updated: any) => void;
}

const ValidatePaymentDialog: React.FC<ValidatePaymentDialogProps> = ({ receipt, isOpen, onClose, onValidated }) => {
  const { t, settings } = useTranslation();
  const { companies } = useSharedData();
  const auth = useAuth();

  const [montant, setMontant] = useState<string>('');
  const [companyId, setCompanyId] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!receipt) return;
    setMontant(receipt.montant ? String(receipt.montant) : '');
    setCompanyId(receipt.companyId || '');
  }, [receipt]);

  const handleValidate = async () => {
    if (!receipt) return;
    if (!montant) {
      alert(t('forms.required') || 'Montant requis');
      return;
    }
    if (!companyId) {
      alert(t('companies.select') || 'Société requise');
      return;
    }
    setLoading(true);
    try {
      const { updatePayment, getPayments } = await import('../services/paymentService');
      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.validated') || 'Déclaration Validée', date: new Date().toISOString() };
      const updates: any = {
        montant: Number(montant),
        companyId,
        companyName: companies.find((c: any) => c.id === companyId)?.name || null,
        status: 'validee',
        validatedAt: new Date().toISOString()
      };
      // append traceability best-effort
      try {
        const current: any = (await getPayments()).find((p: any) => p.id === receipt.id) || {};
        updates.traceability = [...(current.traceability || []), traceEntry];
      } catch (e) {
        updates.traceability = [traceEntry];
      }
      await updatePayment(receipt.id, updates);
      if (onValidated) onValidated({ ...receipt, ...updates });
      onClose();
    } catch (e: any) {
      console.error(e);
      alert(e?.message || (t('forms.deleteFailed') || 'Erreur'));
    } finally {
      setLoading(false);
    }
  };

  if (!receipt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{t('declarations.validate') || 'Valider'}</DialogTitle>
          <DialogDescription>{t('caissier.viewPaymentDesc') || ''}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Photo preview (slightly larger) */}
          <div className="w-full flex justify-center mt-2">
            <div className="bg-muted rounded overflow-hidden" style={{ width: 'min(560px, 92%)', height: 'auto' }}>
              <img src={receipt.photoUrl} alt="reçu" className="object-contain w-full h-auto bg-black" />
            </div>
          </div>

          <div>
            <Label>{t('financial.amount') || 'Montant (DZD)'}</Label>
            <Input value={montant} onChange={e => setMontant(e.target.value)} />
          </div>

          <div>
            <Label>{t('companies.name') || 'Société'}</Label>
            <Select value={companyId} onValueChange={(v: string) => setCompanyId(v)}>
              <SelectTrigger>
                <SelectValue placeholder={t('companies.select') || 'Sélectionner une société'} />
              </SelectTrigger>
              <SelectContent>
                {companies.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onClose()}>{t('forms.cancel') || 'Annuler'}</Button>
            <Button onClick={() => handleValidate()} disabled={loading}>{t('declarations.validate') || 'Valider'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ValidatePaymentDialog;
