import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { useTranslation } from '../../hooks/useTranslation';
import { useSharedData } from '../../contexts/SharedDataContext';

interface ConsultPaymentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  // Use a flexible type because receipts can be created with different shapes
  receipt: any | null;
}

const ConsultPaymentDialog: React.FC<ConsultPaymentDialogProps> = ({ isOpen, onClose, receipt }) => {
  const { t } = useTranslation();
  const { companies } = useSharedData();
  if (!receipt) return null;

  // Resolve company name if companyId provided
  const companyName = receipt.companyName || (receipt.companyId ? (companies.find((c: any) => c.id === receipt.companyId)?.name) : '');

  const programRef = receipt.programReference || (receipt.programNumber ? `DCP/${receipt.year || ''}/${receipt.month || ''}/${receipt.programNumber}` : '');

  return (
    <Dialog open={isOpen} onOpenChange={val => { if (!val) onClose(); }}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('caissier.viewPaymentTitle') || 'Consulter le reçu'}</DialogTitle>
          <DialogDescription>{t('caissier.viewPaymentDesc') || "Consultation du reçu (lecture seule)"}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <div className="w-full flex justify-center">
            <div className="bg-muted rounded overflow-hidden" style={{ width: 'min(520px, 92%)', height: 'auto' }}>
              <img src={receipt.photoUrl} alt="reçu" className="object-contain w-full h-auto bg-black" />
            </div>
          </div>

          <div className="w-full">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>{t('declarations.programNumber') || 'Référence'}</Label>
                <div className="mt-1 font-medium">{programRef}</div>
              </div>

              <div>
                <Label>{t('companies.name') || 'Société'}</Label>
                <div className="mt-1">{companyName || ''}</div>
              </div>

              <div>
                <Label>{t('declarations.createdDate') || 'Date'}</Label>
                <div className="mt-1">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleString() : ''}</div>
              </div>

              <div>
                <Label>{t('declarations.status') || 'État'}</Label>
                <div className="mt-1">{receipt.status ? <Badge className="inline-block">{receipt.status}</Badge> : ''}</div>
              </div>
            </div>

            {receipt.notes && (
              <div className="mt-3">
                <Label>{t('forms.notes') || 'Notes'}</Label>
                <div className="mt-1 whitespace-pre-wrap">{receipt.notes}</div>
              </div>
            )}
          </div>

          <div className="w-full flex justify-end">
            <Button variant="outline" onClick={onClose}>{t('forms.close') || 'Fermer'}</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ConsultPaymentDialog;
