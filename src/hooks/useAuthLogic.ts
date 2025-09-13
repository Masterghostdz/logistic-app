import { useState, useEffect } from 'react';
import { User } from '../types';
import { generateSecureToken, storeSession, clearSession, SESSION_DURATION, SessionData } from '../utils/sessionUtils';
import { loginWithUsername } from '../services/loginService';
import { setUserOnlineStatus } from '../services/userService';
import { setChauffeurOnlineStatus } from '../services/setChauffeurOnlineStatus';

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Login via Firestore (cloud)
  const login = async (username: string, password: string): Promise<boolean> => {
    if (!username || !password) return false;
    try {
      const userData = await loginWithUsername(username, password);
      if (userData) {
        const sessionToken = generateSecureToken();
        const sessionData: SessionData = {
          token: sessionToken,
          userId: userData.id,
          expiresAt: Date.now() + SESSION_DURATION
        };
        storeSession(sessionData);
        setUser({
          id: userData.id,
          username: userData.username || '',
          password: '',
          role: userData.role || 'chauffeur',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          fullName: userData.fullName || '',
          phone: userData.phone || [],
          email: userData.email || '',
          createdAt: userData.createdAt || '',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          avatar: userData.avatar,
          vehicleType: userData.vehicleType,
          employeeType: userData.employeeType
        });
        setIsAuthenticated(true);
        await setUserOnlineStatus(userData.id, true);
        if (userData.role === 'chauffeur') {
          await setChauffeurOnlineStatus(userData.id, true);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  // (Optionnel) À adapter pour Firestore si tu veux changer le mot de passe
  const changePassword = async () => false;

  const logout = async () => {
    if (user) {
      await setUserOnlineStatus(user.id, false);
      if (user.role === 'chauffeur') {
        await setChauffeurOnlineStatus(user.id, false);
      }
    }
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
    console.log('User logged out securely');
  };

  // (Optionnel) À adapter pour Firestore si tu veux restaurer la session
  // Restaure la session utilisateur depuis Firestore avec l'ID
  const restoreSession = async (userId: string): Promise<boolean> => {
    if (!userId) return false;
    try {
      const { getUsers } = await import('../services/userService');
      const users = await getUsers();
      const userData = users.find((u: any) => u.id === userId && u.isActive);
      if (userData) {
        setUser({
          id: userData.id,
          username: userData.username || '',
          password: '',
          role: userData.role || 'chauffeur',
          firstName: userData.firstName || '',
          lastName: userData.lastName || '',
          fullName: userData.fullName || '',
          phone: userData.phone || [],
          email: userData.email || '',
          createdAt: userData.createdAt || '',
          isActive: userData.isActive !== undefined ? userData.isActive : true,
          avatar: userData.avatar,
          vehicleType: userData.vehicleType,
          employeeType: userData.employeeType
        });
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  };

  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (user) {
        // Envoi synchrone du statut offline via sendBeacon
        const urlUser = `${window.location.origin}/api/setUserOffline`;
        const urlChauffeur = `${window.location.origin}/api/setChauffeurOffline`;
        const payload = JSON.stringify({ userId: user.id });
        navigator.sendBeacon(urlUser, payload);
        if (user.role === 'chauffeur') {
          navigator.sendBeacon(urlChauffeur, payload);
        }
      }
    };
    window.addEventListener('unload', handleBeforeUnload);
    return () => window.removeEventListener('unload', handleBeforeUnload);
  }, [user]);

  return {
    user,
    isAuthenticated,
    login,
    changePassword,
    logout,
    restoreSession
  };
};
