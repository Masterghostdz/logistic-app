import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useTranslation } from '../hooks/useTranslation';
import { getAllRefusalReasons } from '../services/refusalReasonService';
import { RefusalReason } from '../types/refusalReason';

interface RefusalReasonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: RefusalReason) => void;
  language: 'fr' | 'en' | 'ar';
}

const RefusalReasonDialog: React.FC<RefusalReasonDialogProps> = ({ isOpen, onClose, onConfirm, language }) => {
  const [reasons, setReasons] = useState<RefusalReason[]>([]);
  const [selectedId, setSelectedId] = useState<string>('');
  const { t } = useTranslation();

  useEffect(() => {
    if (isOpen) {
      getAllRefusalReasons().then(setReasons);
      setSelectedId('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const reason = reasons.find(r => r.id === selectedId);
    if (reason) onConfirm(reason);
  };

  return (
    <Dialog open={isOpen} onOpenChange={open => { if (!open) onClose(); }}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('dashboard.selectRefusalReason') || 'Sélectionner un motif de refus'}</DialogTitle>
        </DialogHeader>
        <Select value={selectedId} onValueChange={setSelectedId}>
          <SelectTrigger>
            <SelectValue placeholder={t('dashboard.selectReasonPlaceholder') || 'Choisir un motif...'} />
          </SelectTrigger>
          <SelectContent>
            {reasons.map(reason => (
              <SelectItem key={reason.id} value={reason.id}>
                {reason[language]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>{t('forms.cancel') || 'Annuler'}</Button>
          <Button onClick={handleConfirm} disabled={!selectedId}>{t('forms.confirm') || 'Confirmer'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RefusalReasonDialog;
