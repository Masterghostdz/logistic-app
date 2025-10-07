import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { success, error } from './ui/use-toast';
import { useTranslation } from '../hooks/useTranslation';
import { Lock } from 'lucide-react';

interface PasswordChangeDialogProps {
  trigger?: React.ReactNode;
}

const PasswordChangeDialog = ({ trigger }: PasswordChangeDialogProps) => {
  const { changePassword } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.newPassword !== formData.confirmPassword) {
      error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (formData.newPassword.length < 6) {
      error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    const successFlag = await changePassword(formData.currentPassword, formData.newPassword);
    
    if (successFlag) {
      success('Mot de passe modifié avec succès');
      setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setOpen(false);
    } else {
      error('Mot de passe actuel incorrect');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="flex items-center gap-2">
            <Lock className="h-4 w-4" />
            {t('profile.changePassword') || 'Changer le mot de passe'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('profile.changePassword') || 'Changer le mot de passe'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="currentPassword">Mot de passe actuel</Label>
            <Input
              id="currentPassword"
              type="password"
              value={formData.currentPassword}
              onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="newPassword">Nouveau mot de passe</Label>
            <Input
              id="newPassword"
              type="password"
              value={formData.newPassword}
              onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('forms.cancel') || 'Annuler'}
            </Button>
            <Button type="submit">
              {t('profile.changePassword') || 'Changer le mot de passe'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default PasswordChangeDialog;
