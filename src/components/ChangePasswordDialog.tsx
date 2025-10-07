import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { KeyRound } from 'lucide-react';
import { success, error, info, warning } from './ui/use-toast';

const ChangePasswordDialog = () => {
  const { changePassword } = useAuth();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
      error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }

    if (passwords.new.length < 6) {
      error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const successFlag = await changePassword(passwords.current, passwords.new);
      if (successFlag) {
        success('Mot de passe modifié avec succès');
        setPasswords({ current: '', new: '', confirm: '' });
        setOpen(false);
      } else {
        error('Mot de passe actuel incorrect');
      }
    } catch (error) {
      error('Erreur lors de la modification du mot de passe');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="w-full justify-start">
          <KeyRound className="mr-2 h-4 w-4" />
          {t('profile.changePassword') || 'Changer le mot de passe'}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t('profile.changePassword') || 'Changer le mot de passe'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="current">{t('forms.currentPassword') || 'Mot de passe actuel'}</Label>
            <Input
              id="current"
              type="password"
              value={passwords.current}
              onChange={(e) => setPasswords({...passwords, current: e.target.value})}
              required
            />
          </div>
          <div>
            <Label htmlFor="new">{t('forms.newPassword') || 'Nouveau mot de passe'}</Label>
            <Input
              id="new"
              type="password"
              value={passwords.new}
              onChange={(e) => setPasswords({...passwords, new: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <div>
            <Label htmlFor="confirm">{t('forms.confirmPassword') || 'Confirmer le nouveau mot de passe'}</Label>
            <Input
              id="confirm"
              type="password"
              value={passwords.confirm}
              onChange={(e) => setPasswords({...passwords, confirm: e.target.value})}
              required
              minLength={6}
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('forms.cancel') || 'Annuler'}
            </Button>
            <Button type="submit">
              {t('forms.confirm') || 'Modifier'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ChangePasswordDialog;
