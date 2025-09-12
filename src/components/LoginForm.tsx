import React, { useState } from 'react';
import { useFirestoreConnectionStatus } from '../services/useFirestoreConnectionStatus';
import { useIsOnline } from '../services/useIsOnline';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { toast } from 'sonner';
import { LogIn, User, Lock } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

const LoginForm = () => {
  const firestoreStatus = useFirestoreConnectionStatus();
  const isOnline = useIsOnline();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();

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
    <div className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4 relative">
      <Card className="w-full max-w-md relative overflow-visible">
        {/* Language selector inside Card, centered at the top */}
        <div className="flex justify-center mt-4 mb-2">
          <select
            className="rounded border px-2 py-1 text-sm bg-white dark:bg-gray-900 dark:text-white"
            value={settings.language}
            onChange={e => updateSettings({ language: e.target.value as 'fr' | 'en' | 'ar' })}
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
          </select>
        </div>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <LogIn className="w-6 h-6 text-white" />
            </div>
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
      {/* Firestore status band inside the Card, below content, with top-rounded corners and top border */}
      <div className="flex justify-center mt-2 mb-1">
        <div
          className={
            `px-4 py-2 rounded-t-lg shadow-md text-sm font-medium min-w-[220px] text-center transition-colors pointer-events-auto ` +
            (isOnline
              ? (firestoreStatus === 'connected'
                  ? 'bg-green-100 text-green-800 border-t-2 border-green-400'
                  : firestoreStatus === 'connecting'
                    ? 'bg-yellow-100 text-yellow-800 border-t-2 border-yellow-400'
                    : 'bg-red-100 text-red-800 border-t-2 border-red-400')
              : 'bg-gray-200 text-gray-700 border-t-2 border-gray-400')
          }
        >
          {!isOnline && t('login.offline')}
          {isOnline && firestoreStatus === 'connected' && t('login.connected')}
          {isOnline && firestoreStatus === 'connecting' && t('login.connecting')}
          {isOnline && firestoreStatus === 'disconnected' && t('login.notConnected')}
        </div>
      </div>
      </Card>
    </div>
  );
};

export default LoginForm;
