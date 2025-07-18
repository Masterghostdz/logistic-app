
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { LogIn, User, Lock } from 'lucide-react';
import { useOnlineStatus } from '../contexts/OnlineStatusContext';

const LoginForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const { isOnline } = useOnlineStatus();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const success = await login(username, password);
      if (!success) {
        toast.error(t('auth.invalidCredentials'));
      }
    } catch (error) {
      toast.error(t('forms.error'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
          </div>
          <div className="flex justify-center mb-2">
            <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}
                  title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}>
              <span className={`inline-block w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}></span>
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900 dark:text-white">
            {t('auth.welcome')}
          </CardTitle>
          <CardDescription className="text-gray-600 dark:text-gray-400">
            {t('auth.subtitle')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-sm font-medium">
                {t('auth.username')}
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder={t('auth.username')}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-sm font-medium">
                {t('auth.password')}
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password')}
                  className="pl-10"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full"
            >
              {isLoading ? "..." : t('auth.loginButton')}
            </Button>
          </form>
          
          <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <h4 className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">
              Comptes de démonstration :
            </h4>
            <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
              <div><strong>chauffeur</strong> - Mot de passe: demo123</div>
              <div><strong>planificateur</strong> - Mot de passe: demo123</div>
              <div><strong>financier</strong> - Mot de passe: demo123</div>
              <div><strong>financier_unite</strong> - Mot de passe: demo123</div>
              <div><strong>admin</strong> - Mot de passe: admin123</div>
            </div>
            <div className="mt-2 text-xs text-gray-500 italic">
              Note: Ces mots de passe sont sécurisés et hachés côté serveur
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LoginForm;
