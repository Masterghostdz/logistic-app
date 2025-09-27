
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

// Expose current user globally for non-hook imports where necessary (best-effort)
try {
  Object.defineProperty(window, '__APP_USER', {
    configurable: true,
    enumerable: false,
    get: () => {
      // lazy: read from context by creating a temporary element? Not possible here; leave undefined until set by Auth logic
      return (window as any).__APP_USER_INTERNAL || null;
    },
    set: (v) => {
      (window as any).__APP_USER_INTERNAL = v;
    }
  });
} catch (e) {
  // ignore in non-browser environments
}
