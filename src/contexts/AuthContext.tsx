
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
    fullName: 'Jean Martin',
    phone: '+33 6 12 34 56 78',
    createdAt: new Date().toISOString(),
    isActive: true
  },
  {
    id: '2',
    username: 'planificateur',
    password: 'demo123',
    role: 'planificateur' as const,
    fullName: 'Marie Dubois',
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
    fullName: 'Pierre Moreau',
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
    fullName: 'Sophie Bernard',
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
    fullName: 'Admin System',
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
    console.log('AuthProvider initialized');
    
    // Force reset and initialize demo accounts
    const userAccounts = demoAccounts.map(acc => ({
      id: acc.id,
      username: acc.username,
      role: acc.role,
      fullName: acc.fullName,
      firstName: acc.fullName.split(' ')[0],
      lastName: acc.fullName.split(' ')[1] || '',
      email: acc.email,
      phone: acc.phone,
      createdAt: acc.createdAt,
      isActive: acc.isActive,
      password: acc.password
    }));
    
    localStorage.setItem('logigrine_users', JSON.stringify(userAccounts));
    console.log('Demo accounts initialized:', userAccounts);

    // Check for saved user
    const savedUser = localStorage.getItem('logigrine_user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
        setIsAuthenticated(true);
        console.log('Restored user session:', parsedUser);
      } catch (error) {
        console.error('Error parsing saved user:', error);
        localStorage.removeItem('logigrine_user');
      }
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    console.log('Login attempt:', { username, password });
    
    const users = JSON.parse(localStorage.getItem('logigrine_users') || '[]');
    console.log('Available users:', users);
    
    const account = users.find(
      (acc: any) => acc.username === username && acc.password === password && acc.isActive
    );

    console.log('Found account:', account);

    if (account) {
      const { password: _, ...userWithoutPassword } = account;
      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      localStorage.setItem('logigrine_user', JSON.stringify(userWithoutPassword));
      console.log('Login successful for user:', userWithoutPassword);
      return true;
    }

    console.log('Login failed - invalid credentials');
    return false;
  };

  const changePassword = async (oldPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) return false;

    const users = JSON.parse(localStorage.getItem('logigrine_users') || '[]');
    const userIndex = users.findIndex((u: any) => u.id === user.id);
    
    if (userIndex === -1 || users[userIndex].password !== oldPassword) {
      return false;
    }

    // Update password
    users[userIndex].password = newPassword;
    localStorage.setItem('logigrine_users', JSON.stringify(users));
    
    return true;
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('logigrine_user');
    console.log('User logged out');
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
