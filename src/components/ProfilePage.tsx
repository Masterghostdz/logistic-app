import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';

import React, { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import useTableZoom from '../hooks/useTableZoom';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Phone, Car, Shield, Briefcase } from 'lucide-react';
import { success, error, info } from './ui/use-toast';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  // Tous les hooks doivent être appelés avant tout return !
  const isMobileScreen = useIsMobile();
  const { settings } = useSettings();
  const auth = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  // On considère mobile si le mode est forcé ou si l'écran est petit
  const isMobile = settings.viewMode === 'mobile' || isMobileScreen;

  // Déstructuration avant tout return
  const { user, changePassword } = auth || {};
  if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production') {
    try { console.log('[ProfilePage] auth.user =', user); } catch (e) {}
  }
  const { badgeClass, badgeStyle } = useTableZoom();
  const { t } = useTranslation();

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'planificateur':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'caissier':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'chauffeur':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  // Gestion absence de contexte ou d'utilisateur
  if (!auth || !user) {
    return <div>{t('profile.userNotFound') || 'Utilisateur non trouvé'}</div>;
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      const successFlag = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (successFlag) {
        success('Mot de passe modifié avec succès');
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        error('Mot de passe actuel incorrect');
      }
    } catch (error) {
      error('Erreur lors de la modification du mot de passe');
    }
  };

  // Layout mobile friendly si mobile, sinon desktop (2 colonnes)
  return isMobile ? (
    <div className="space-y-4 px-2 py-2 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2 sticky top-0 z-20 bg-background/90 py-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack} aria-label={t('buttons.back') || 'Retour'} title={t('buttons.back') || 'Retour'}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold flex-1 text-center">{t('profile.title') || 'Mon Profil'}</h1>
      </div>


      <div className="space-y-4">
        <Card>
          <CardHeader className="items-center text-center pb-2">
            <User className="h-10 w-10 mx-auto mb-2 text-primary" />
            <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div>
              <Label className="text-xs font-medium text-gray-500">{t('forms.firstName') || 'Prénom'}</Label>
              <p className="text-base">{user.firstName}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">{t('forms.name') || 'Nom'}</Label>
              <p className="text-base">{user.lastName}</p>
            </div>
            <div>
              <Label className="text-xs font-medium text-gray-500">{t('auth.username') || 'Nom d\'utilisateur'}</Label>
              <p className="text-base">{user.username}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Briefcase className="h-5 w-5" />
              {t('profile.professionalInfo') || 'Information Professionnelle'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-4 pb-4">
            <div>
              <Label className="text-xs font-medium text-gray-500">{t('forms.mobile') || 'Téléphone'}</Label>
              <p className="text-base">{user.phone || <span className="text-gray-400">{t('profile.notProvided') || 'Non renseigné'}</span>}</p>
            </div>
            {user.email && (
              <div>
                <Label className="text-xs font-medium text-gray-500">Email</Label>
                <p className="text-base">{user.email}</p>
              </div>
            )}
            {user.role === 'chauffeur' && (
              <div>
                <Label className="text-xs font-medium text-gray-500">Type de véhicule</Label>
                <p className="text-base flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {user.vehicleType || <span className="text-gray-400">Non renseigné</span>}
                </p>
              </div>
            )}
            {user.role !== 'planificateur' && (
              <div>
                <Label className="text-xs font-medium text-gray-500">Type d'employé</Label>
                <div className="mt-1">
                  <Badge size="md" variant={user.employeeType === 'interne' ? 'default' : 'secondary'} style={{ ...badgeStyle }} className={`${badgeClass}`}>
                    {user.employeeType === 'interne' ? t('chauffeurs.employeeTypeShort.interne') : user.employeeType === 'externe' ? t('chauffeurs.employeeTypeShort.externe') : 'Non renseigné'}
                  </Badge>
                </div>
              </div>
            )}
            <div>
              <Label className="text-xs font-medium text-gray-500">{t('admin.role') || 'Rôle'}</Label>
              <div className="mt-1">
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} border ${getRoleBadgeColor(user.role)}`}>
                  {t(`roles.${user.role}`) || user.role}
                </Badge>
              </div>
            </div>
            {user.role === 'caissier' && (
              <div>
                <Label className="text-xs font-medium text-gray-500">Société</Label>
                <p className="text-base">{user.companyName || <span className="text-gray-400">Société non renseignée</span>}</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            {t('profile.securityTitle') || 'Sécurité'}
          </CardTitle>
          <CardDescription className="text-xs">
            {t('profile.securityDescription') || 'Modifiez votre mot de passe pour sécuriser votre compte'}
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {!isChangingPassword ? (
            <Button className="w-full" onClick={() => setIsChangingPassword(true)}>
              {t('profile.changePassword') || 'Changer le mot de passe'}
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <Label htmlFor="currentPassword">{t('forms.currentPassword') || 'Mot de passe actuel'}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('forms.newPassword') || 'Nouveau mot de passe'}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('forms.confirmPassword') || 'Confirmer le nouveau mot de passe'}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button className="flex-1" type="submit">{t('forms.confirm') || 'Confirmer'}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  {t('forms.cancel') || 'Annuler'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  ) : (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={onBack} aria-label={t('buttons.back') || 'Retour'} title={t('buttons.back') || 'Retour'}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{t('profile.title') || 'Mon Profil'}</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
              <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              {t('profile.personalInfo') || 'Informations personnelles'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">{t('forms.firstName') || 'Prénom'}</Label>
              <p className="text-lg">{user.firstName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">{t('forms.name') || 'Nom'}</Label>
              <p className="text-lg">{user.lastName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">{t('auth.username') || "Nom d'utilisateur"}</Label>
              <p className="text-lg">{user.username}</p>
            </div>
            {/* Role moved to Professional Information card */}
          </CardContent>
        </Card>

        {/* Informations de contact et véhicule */}
        <Card>
          <CardHeader>
                <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                {t('profile.professionalInfo') || 'Information Professionnelle'}
              </CardTitle>
            </CardHeader>
          <CardContent className="space-y-4">
            {user.phone && (
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('forms.mobile') || 'Téléphone'}</Label>
                <p className="text-lg">{user.phone}</p>
              </div>
            )}
            {user.email && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            )}
            {user.role === 'chauffeur' && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Type de véhicule</Label>
                <p className="text-lg flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {user.vehicleType || <span className="text-gray-400">Non renseigné</span>}
                </p>
              </div>
            )}
            {user.role !== 'planificateur' && user.employeeType && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Type d'employé</Label>
                <div className="mt-1">
                  <Badge size="md" variant={user.employeeType === 'interne' ? 'default' : 'secondary'} style={{ ...badgeStyle }} className={badgeClass}>
                    {user.employeeType === 'interne' ? t('chauffeurs.employeeTypeShort.interne') : t('chauffeurs.employeeTypeShort.externe')}
                  </Badge>
                </div>
              </div>
            )}
            {/* Role badge shown here for professional info */}
            {user.role && (
              <div>
                <Label className="text-sm font-medium text-gray-500">{t('admin.role') || 'Rôle'}</Label>
                <div className="mt-1">
                  <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} border ${getRoleBadgeColor(user.role)}`}>
                    {t(`roles.${user.role}`) || user.role}
                  </Badge>
                </div>
              </div>
            )}
            {/* Show company for caissier role beneath employee type */}
            {user.role === 'caissier' && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Société</Label>
                <div className="text-lg">{user.companyName || <span className="text-gray-400">Société non renseignée</span>}</div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Changement de mot de passe */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            {t('profile.securityTitle') || 'Sécurité'}
          </CardTitle>
          <CardDescription>
            {t('profile.securityDescription') || 'Modifiez votre mot de passe pour sécuriser votre compte'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>
              {t('profile.changePassword') || 'Changer le mot de passe'}
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">{t('forms.currentPassword') || 'Mot de passe actuel'}</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">{t('forms.newPassword') || 'Nouveau mot de passe'}</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={passwordForm.newPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div>
                <Label htmlFor="confirmPassword">{t('forms.confirmPassword') || 'Confirmer le nouveau mot de passe'}</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={passwordForm.confirmPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit">{t('forms.confirm') || 'Confirmer'}</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  {t('forms.cancel') || 'Annuler'}
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProfilePage;
