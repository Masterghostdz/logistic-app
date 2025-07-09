
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { getStoredSession, clearSession } from '../utils/sessionUtils';
import { useAuthLogic } from '../hooks/useAuthLogic';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, login, changePassword, logout, restoreSession } = useAuthLogic();

  useEffect(() => {
    console.log('AuthProvider initialized with secure session management');
    
    // Check for valid session
    const session = getStoredSession();
    if (session) {
      const sessionRestored = restoreSession(session.userId);
      if (!sessionRestored) {
        // Invalid user, clear session
        clearSession();
      }
    } else {
      // Session expired or doesn't exist
      console.log('No valid session found');
    }
  }, [restoreSession]);

  return (
    <AuthContext.Provider value={{ user, login, logout, changePassword, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
