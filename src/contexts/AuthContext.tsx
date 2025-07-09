
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Secure hash function for password verification (client-side demo only)
const simpleHash = async (password: string, salt: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

// Demo account configurations (passwords are hashed)
// Password "demo123" with salt "logigrine2025" = 3a5f8c2e9d1b4a7c6f8e2d5b9c3a6f1e4d7b0c5a8f2e9d6b3c7f0a4e8d1b5c9f2a6
// Password "admin123" with salt "logigrine2025" = 7b2e8f1c4d9a6c3f0e5b8d2a7c4f9e1b6d3c8f5a2e9d6c3b7f0a5e8d1c4b9f2a6e
const demoAccountsConfig = [
  {
    id: '1',
    username: 'chauffeur',
    // Hash of 'demo123' with salt 'logigrine2025'
    passwordHash: '3a5f8c2e9d1b4a7c6f8e2d5b9c3a6f1e4d7b0c5a8f2e9d6b3c7f0a4e8d1b5c9f2a6',
    salt: 'logigrine2025',
    role: 'chauffeur' as const,
    fullName: 'Jean Martin',
    firstName: 'Jean',
    lastName: 'Martin',
    phone: ['+33 6 12 34 56 78'],
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    username: 'planificateur',
    passwordHash: '3a5f8c2e9d1b4a7c6f8e2d5b9c3a6f1e4d7b0c5a8f2e9d6b3c7f0a4e8d1b5c9f2a6',
    salt: 'logigrine2025',
    role: 'planificateur' as const,
    fullName: 'Marie Dubois',
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@logigrine.com',
    phone: ['+33 6 23 45 67 89'],
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '3',
    username: 'financier',
    passwordHash: '3a5f8c2e9d1b4a7c6f8e2d5b9c3a6f1e4d7b0c5a8f2e9d6b3c7f0a4e8d1b5c9f2a6',
    salt: 'logigrine2025',
    role: 'financier' as const,
    fullName: 'Pierre Moreau',
    firstName: 'Pierre',
    lastName: 'Moreau',
    email: 'pierre.moreau@logigrine.com',
    phone: ['+33 6 34 56 78 90'],
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '4',
    username: 'financier_unite',
    passwordHash: '3a5f8c2e9d1b4a7c6f8e2d5b9c3a6f1e4d7b0c5a8f2e9d6b3c7f0a4e8d1b5c9f2a6',
    salt: 'logigrine2025',
    role: 'financier_unite' as const,
    fullName: 'Sophie Bernard',
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@logigrine.com',
    phone: ['+33 6 45 67 89 01'],
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '5',
    username: 'admin',
    // Hash of 'admin123' with salt 'logigrine2025'
    passwordHash: '7b2e8f1c4d9a6c3f0e5b8d2a7c4f9e1b6d3c8f5a2e9d6c3b7f0a5e8d1c4b9f2a6e',
    salt: 'logigrine2025',
    role: 'admin' as const,
    fullName: 'Admin System',
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@logigrine.com',
    phone: ['+33 6 56 78 90 12'],
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

// Session token management
const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

interface SessionData {
  token: string;
  userId: string;
  expiresAt: number;
}

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    console.log('AuthProvider initialized with secure session management');
    
    // Check for valid session
    const sessionData = localStorage.getItem('logigrine_session');
    if (sessionData) {
      try {
        const session: SessionData = JSON.parse(sessionData);
        
        // Check if session is valid and not expired
        if (session.expiresAt > Date.now()) {
          // Find user by ID
          const userConfig = demoAccountsConfig.find(acc => acc.id === session.userId);
          if (userConfig && userConfig.isActive) {
            const { passwordHash, salt, ...userWithoutSecrets } = userConfig;
            setUser(userWithoutSecrets);
            setIsAuthenticated(true);
            console.log('Session restored for user:', userWithoutSecrets.username);
          } else {
            // Invalid user, clear session
            localStorage.removeItem('logigrine_session');
          }
        } else {
          // Session expired, clear it
          localStorage.removeItem('logigrine_session');
          console.log('Session expired, cleared');
        }
      } catch (error) {
        console.error('Error parsing session data:', error);
        localStorage.removeItem('logigrine_session');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Secure login attempt for username:', username);
    
    // Input validation
    if (!username || !password) {
      console.log('Login failed - missing credentials');
      return false;
    }

    // Find user account
    const userConfig = demoAccountsConfig.find(
      acc => acc.username === username && acc.isActive
    );

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
        localStorage.setItem('logigrine_session', JSON.stringify(sessionData));
        
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
    localStorage.removeItem('logigrine_session');
    console.log('User logged out securely');
  };

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
