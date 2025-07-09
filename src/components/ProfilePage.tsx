
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { ArrowLeft, User, Phone, Car } from 'lucide-react';
import { toast } from 'sonner';
import PasswordField from './PasswordField';

interface ProfilePageProps {
  onBack: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onBack }) => {
  const { user, changePassword } = useAuth();
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

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

  if (!user) {
    return <div>Utilisateur non trouvé</div>;
  }

  return (
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
            {user.password && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Mot de passe actuel</Label>
                <PasswordField password={user.password} showLabel={false} />
              </div>
            )}
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
            {user.vehicleType && (
              <div>
                <Label className="text-sm font-medium text-gray-500">Type de véhicule</Label>
                <p className="text-lg flex items-center gap-2">
                  <Car className="h-4 w-4" />
                  {user.vehicleType}
                </p>
              </div>
            )}
            {user.employeeType && (
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
          <CardTitle>Sécurité</CardTitle>
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
