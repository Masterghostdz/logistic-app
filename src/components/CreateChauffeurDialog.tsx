import React from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Chauffeur } from '../types';
import { useSharedData } from '../contexts/SharedDataContext';
import PhoneNumbersField from './PhoneNumbersField';

interface CreateChauffeurDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingChauffeur: Chauffeur | null;
  newChauffeur: {
    fullName: string;
    username: string;
    password: string;
    confirmPassword?: string;
    salt?: string;
    phone: string[];
    vehicleType: string;
    employeeType: 'interne' | 'externe';
  };
  setNewChauffeur: (chauffeur: any) => void;
}

const CreateChauffeurDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingChauffeur, 
  newChauffeur, 
  setNewChauffeur 
}: CreateChauffeurDialogProps) => {
  const { vehicleTypes } = useSharedData();
  const { t } = useTranslation();
  const [showPasswordDialog, setShowPasswordDialog] = React.useState(false);

  const handleClose = () => {
    onClose();
    setNewChauffeur({
      fullName: '',
      username: '',
      password: '',
      phone: [''],
      vehicleType: '',
      employeeType: 'interne'
    });
  };

  React.useEffect(() => {
    if (showPasswordDialog) {
      setNewChauffeur((prev: any) => ({ ...prev, password: '', confirmPassword: '' }));
    }
  }, [showPasswordDialog]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
          <DialogHeader>
          <DialogTitle>
            {editingChauffeur ? `${t('forms.edit')} ${t('chauffeurs.title')}` : t('chauffeurs.new')}
          </DialogTitle>
          <DialogDescription>
            {editingChauffeur
              ? t('forms.edit')
              : t('chauffeurs.new')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">{t('forms.name')} *</Label>
            <Input
              id="fullName"
              value={newChauffeur.fullName}
              onChange={(e) => setNewChauffeur({ ...newChauffeur, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">{t('chauffeurs.username')} *</Label>
            <Input
              id="username"
              value={newChauffeur.username}
              onChange={(e) => setNewChauffeur({ ...newChauffeur, username: e.target.value })}
              required
            />
          </div>
          <div>
            <Label>{t('forms.password')}</Label>
            <div className="mt-2">
              <Button type="button" variant="outline" onClick={() => setShowPasswordDialog(true)}>
                {t('forms.edit')} {t('forms.password')}
              </Button>
            </div>
            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{t('forms.edit')} {t('forms.password')}</DialogTitle>
                  <DialogDescription>{t('settings.newPassword')} / {t('settings.confirmPassword')}</DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Label htmlFor="newPassword">{t('settings.newPassword')}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newChauffeur.password || ''}
                    onChange={e => setNewChauffeur({ ...newChauffeur, password: e.target.value })}
                  />
                  <Label htmlFor="confirmPassword">{t('settings.confirmPassword')}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={newChauffeur.confirmPassword || ''}
                    onChange={e => setNewChauffeur({ ...newChauffeur, confirmPassword: e.target.value })}
                  />
                  <Button type="button" onClick={() => setShowPasswordDialog(false)}>
                    {t('forms.save')}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
          <div>
            <PhoneNumbersField
              phones={newChauffeur.phone}
              onChange={(phones) => setNewChauffeur({ ...newChauffeur, phone: phones })}
              label={t('planificateur.phoneNumbers')}
              addLabel={t('planificateur.add')}
            />
          </div>
          <div>
            <Label htmlFor="vehicleType">{t('chauffeurs.vehicleType')}</Label>
                    <Select value={newChauffeur.vehicleType} onValueChange={(value) => setNewChauffeur({ ...newChauffeur, vehicleType: value })}>
              <SelectTrigger>
                <SelectValue placeholder={t('forms.selectPlaceholder') || 'Sélectionner un type'} />
              </SelectTrigger>
              <SelectContent>
                        {vehicleTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>{type.name}</SelectItem>
                        ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="employeeType">{t('chauffeurs.employeeType')}</Label>
            <Select value={newChauffeur.employeeType} onValueChange={(value: 'interne' | 'externe') => setNewChauffeur({ ...newChauffeur, employeeType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interne">{t('chauffeurs.internal')}</SelectItem>
                <SelectItem value="externe">{t('chauffeurs.external')}</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingChauffeur ? t('forms.edit') : t('chauffeurs.new')}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              {t('forms.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChauffeurDialog;
