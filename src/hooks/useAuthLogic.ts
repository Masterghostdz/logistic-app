
import { useState } from 'react';
import { User } from '../types';
import { simpleHash } from '../utils/authUtils';
import { generateSecureToken, storeSession, clearSession, SESSION_DURATION, SessionData } from '../utils/sessionUtils';
import { findAccountByUsername, findAccountById, demoAccountsConfig } from '../config/demoAccounts';

export const useAuthLogic = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Secure login attempt for username:', username);
    
    // Input validation
    if (!username || !password) {
      console.log('Login failed - missing credentials');
      return false;
    }

    // Find user account
    const userConfig = findAccountByUsername(username);

    if (!userConfig) {
      console.log('Login failed - user not found');
      return false;
    }

    try {
      // Verify password hash
      const inputPasswordHash = await simpleHash(password, userConfig.salt);
      console.log('Expected hash:', userConfig.passwordHash);
      console.log('Computed hash:', inputPasswordHash);
      
      if (inputPasswordHash === userConfig.passwordHash) {
        // Create secure session
        const sessionToken = generateSecureToken();
        const sessionData: SessionData = {
          token: sessionToken,
          userId: userConfig.id,
          expiresAt: Date.now() + SESSION_DURATION
        };

        // Store session (not user data)
        storeSession(sessionData);
        
        // Set user state without password data
        const { passwordHash, salt, ...userWithoutSecrets } = userConfig;
        setUser(userWithoutSecrets);
        setIsAuthenticated(true);
        
        console.log('Login successful for user:', userWithoutSecrets.username);
        return true;
      } else {
        console.log('Login failed - invalid password');
        return false;
      }
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    // Input validation
    if (!oldPassword || !newPassword) {
      return false;
    }

    if (newPassword.length < 6) {
      return false;
    }

    try {
      // Find current user config
      const userConfig = demoAccountsConfig.find(acc => acc.id === user.id);
      if (!userConfig) return false;

      // Verify old password
      const oldPasswordHash = await simpleHash(oldPassword, userConfig.salt);
      if (oldPasswordHash !== userConfig.passwordHash) {
        return false;
      }

      // In a real application, this would update the database
      // For demo purposes, we'll update the in-memory config
      const newPasswordHash = await simpleHash(newPassword, userConfig.salt);
      userConfig.passwordHash = newPasswordHash;
      
      console.log('Password changed successfully for user:', user.username);
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    clearSession();
    console.log('User logged out securely');
  };

  const restoreSession = (sessionUserId: string): boolean => {
    const userConfig = findAccountById(sessionUserId);
    if (userConfig && userConfig.isActive) {
      const { passwordHash, salt, ...userWithoutSecrets } = userConfig;
      setUser(userWithoutSecrets);
      setIsAuthenticated(true);
      console.log('Session restored for user:', userWithoutSecrets.username);
      return true;
    }
    return false;
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
