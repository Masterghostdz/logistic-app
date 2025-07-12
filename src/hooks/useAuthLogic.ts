
import { useState } from 'react';
import { User } from '../types';
import { generateSecureToken, storeSession, clearSession, SESSION_DURATION, SessionData } from '../utils/sessionUtils';
import { loginWithUsername } from '../services/loginService';

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
        // S'assure que tous les champs User sont présents
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
      console.error('Login error:', error);
      return false;
    }
  };

  // (Optionnel) À adapter pour Firestore si tu veux changer le mot de passe
  const changePassword = async () => false;

  const logout = () => {
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

  return {
    user,
    isAuthenticated,
    login,
    changePassword,
    logout,
    restoreSession
  };
};
