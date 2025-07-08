
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType } from '../types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Comptes de démonstration
const demoAccounts = [
  {
    id: '1',
    username: 'chauffeur',
    password: 'demo123',
    role: 'chauffeur' as const,
    firstName: 'Jean',
    lastName: 'Martin',
    email: 'jean.martin@logigrine.com',
    phone: '+33 6 12 34 56 78',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    username: 'planificateur',
    password: 'demo123',
    role: 'planificateur' as const,
    firstName: 'Marie',
    lastName: 'Dubois',
    email: 'marie.dubois@logigrine.com',
    phone: '+33 6 23 45 67 89',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '3',
    username: 'financier',
    password: 'demo123',
    role: 'financier' as const,
    firstName: 'Pierre',
    lastName: 'Moreau',
    email: 'pierre.moreau@logigrine.com',
    phone: '+33 6 34 56 78 90',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '4',
    username: 'financier_unite',
    password: 'demo123',
    role: 'financier_unite' as const,
    firstName: 'Sophie',
    lastName: 'Bernard',
    email: 'sophie.bernard@logigrine.com',
    phone: '+33 6 45 67 89 01',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '5',
    username: 'admin',
    password: 'admin123',
    role: 'admin' as const,
    firstName: 'Admin',
    lastName: 'System',
    email: 'admin@logigrine.com',
    phone: '+33 6 56 78 90 12',
    createdAt: new Date().toISOString(),
    isActive: true
  }
];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Vérifier s'il y a un utilisateur connecté dans localStorage
    const savedUser = localStorage.getItem('logigrine_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('logigrine_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    const account = demoAccounts.find(
      acc => acc.username === username && acc.password === password
    );

    if (account) {
      const { password: _, ...userWithoutPassword } = account;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('logigrine_user', JSON.stringify(userWithoutPassword));
      return true;
    }

    return false;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('logigrine_user');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
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
