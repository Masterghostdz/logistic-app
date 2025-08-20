
import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';
import { getStoredSession, clearSession } from '../utils/sessionUtils';
import { useAuthLogic } from '../hooks/useAuthLogic';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user, isAuthenticated, login, changePassword, logout, restoreSession } = useAuthLogic();
  const [sessionChecked, setSessionChecked] = React.useState(false);

  React.useEffect(() => {
    if (!sessionChecked) {
      console.log('AuthProvider initialized with secure session management');
      // Check for valid session
      const session = getStoredSession();
      if (session) {
        restoreSession(session.userId).then((sessionRestored) => {
          if (!sessionRestored) {
            clearSession();
          }
          setSessionChecked(true);
        });
      } else {
        // Session expired or doesn't exist
        console.log('No valid session found');
        setSessionChecked(true);
      }
    }
  }, [sessionChecked, restoreSession]);

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
