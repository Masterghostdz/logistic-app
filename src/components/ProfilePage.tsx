import { useIsMobile } from '../hooks/use-mobile';
import { useSettings } from '../contexts/SettingsContext';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Phone, Car, Shield } from 'lucide-react';
import { toast } from 'sonner';

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

  // Gestion absence de contexte ou d'utilisateur
  if (!auth || !auth.user) {
    return <div>Utilisateur non trouvé</div>;
  }
  const { user, changePassword } = auth;

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Les nouveaux mots de passe ne correspondent pas');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Le nouveau mot de passe doit contenir au moins 6 caractères');
      return;
    }
    try {
      const success = await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      if (success) {
        toast.success('Mot de passe modifié avec succès');
        setIsChangingPassword(false);
        setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        toast.error('Mot de passe actuel incorrect');
      }
    } catch (error) {
      toast.error('Erreur lors de la modification du mot de passe');
    }
  };

  // Layout mobile friendly si mobile, sinon desktop (2 colonnes)
  return isMobile ? (
    <div className="space-y-4 px-2 py-2 max-w-md mx-auto w-full">
      <div className="flex items-center gap-2 sticky top-0 z-20 bg-background/90 py-2">
        <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
          <ArrowLeft className="h-6 w-6" />
        </Button>
        <h1 className="text-xl font-bold flex-1 text-center">Mon Profil</h1>
      </div>


      <Card className="p-0">
        <CardHeader className="items-center text-center pb-2">
          <User className="h-10 w-10 mx-auto mb-2 text-primary" />
          <CardTitle className="text-lg">{user.firstName} {user.lastName}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 px-4 pb-4">
          <div>
            <Label className="text-xs font-medium text-gray-500">Prénom</Label>
            <p className="text-base">{user.firstName}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">Nom</Label>
            <p className="text-base">{user.lastName}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">Nom d'utilisateur</Label>
            <p className="text-base">{user.username}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">Rôle</Label>
            <Badge variant="outline" className="ml-2">
              {user.role === 'chauffeur' ? 'Chauffeur' : 
               user.role === 'planificateur' ? 'Planificateur' :
               user.role === 'financier' ? 'Financier' : 
               user.role === 'financier_unite' ? 'Financier Unité' : 'Administrateur'}
            </Badge>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">Téléphone</Label>
            <p className="text-base">{user.phone || <span className="text-gray-400">Non renseigné</span>}</p>
          </div>
          <div>
            <Label className="text-xs font-medium text-gray-500">Email</Label>
            <p className="text-base">{user.email || <span className="text-gray-400">Non renseigné</span>}</p>
          </div>
          {user.role !== 'planificateur' && (
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
              <Badge variant={user.employeeType === 'interne' ? 'default' : 'secondary'} className="ml-2">
                {user.employeeType === 'interne' ? 'Interne' : user.employeeType === 'externe' ? 'Externe' : 'Non renseigné'}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <Shield className="h-5 w-5" />
            Sécurité
          </CardTitle>
          <CardDescription className="text-xs">
            Modifiez votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 pb-4">
          {!isChangingPassword ? (
            <Button className="w-full" onClick={() => setIsChangingPassword(true)}>
              Changer le mot de passe
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-3">
              <div>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
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
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
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
                <Button className="flex-1" type="submit">Confirmer</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Annuler
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
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold">Mon Profil</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informations personnelles */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Informations personnelles
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-sm font-medium text-gray-500">Prénom</Label>
              <p className="text-lg">{user.firstName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Nom</Label>
              <p className="text-lg">{user.lastName}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Nom d'utilisateur</Label>
              <p className="text-lg">{user.username}</p>
            </div>
            <div>
              <Label className="text-sm font-medium text-gray-500">Rôle</Label>
              <Badge variant="outline" className="mt-1">
                {user.role === 'chauffeur' ? 'Chauffeur' : 
                 user.role === 'planificateur' ? 'Planificateur' :
                 user.role === 'financier' ? 'Financier' : 
                 user.role === 'financier_unite' ? 'Financier Unité' : 'Administrateur'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Informations de contact et véhicule */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Contact & Véhicule
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user.phone && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Téléphone</Label>
                <p className="text-lg">{user.phone}</p>
              </div>
            )}
            {user.email && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Email</Label>
                <p className="text-lg">{user.email}</p>
              </div>
            )}
            {user.role !== 'planificateur' && user.vehicleType && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Type de véhicule</Label>
                <p className="text-lg flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {user.vehicleType}
                </p>
              </div>
            )}
            {user.role !== 'planificateur' && user.employeeType && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Type d'employé</Label>
                <Badge variant={user.employeeType === 'interne' ? 'default' : 'secondary'}>
                  {user.employeeType === 'interne' ? 'Interne' : 'Externe'}
                </Badge>
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
            Sécurité
          </CardTitle>
          <CardDescription>
            Modifiez votre mot de passe pour sécuriser votre compte
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!isChangingPassword ? (
            <Button onClick={() => setIsChangingPassword(true)}>
              Changer le mot de passe
            </Button>
          ) : (
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div>
                <Label htmlFor="currentPassword">Mot de passe actuel</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={passwordForm.currentPassword}
                  onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                  required
                />
              </div>
              <div>
                <Label htmlFor="newPassword">Nouveau mot de passe</Label>
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
                <Label htmlFor="confirmPassword">Confirmer le nouveau mot de passe</Label>
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
                <Button type="submit">Confirmer</Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => {
                    setIsChangingPassword(false);
                    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                  }}
                >
                  Annuler
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
