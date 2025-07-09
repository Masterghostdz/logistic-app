
// Demo account configurations (passwords are hashed)
// Password "demo123" with salt "logigrine2025" = 583ef6136b8e990013e35202d9e7e9577b0cb637bed69f7723e009cde0b774ca
// Password "admin123" with salt "logigrine2025" = 52a51b5cfd788a6d81c881ab9002deece4e1c114f514a2079d86a3c19b7ecdca

export interface DemoAccount {
  id: string;
  username: string;
  passwordHash: string;
  salt: string;
  role: 'chauffeur' | 'planificateur' | 'financier' | 'financier_unite' | 'admin';
  fullName: string;
  firstName: string;
  lastName: string;
  phone?: string[];
  email?: string;
  createdAt: string;
  isActive: boolean;
}

export const demoAccountsConfig: DemoAccount[] = [
  {
    id: '1',
    username: 'chauffeur',
    // Hash of 'demo123' with salt 'logigrine2025'
    passwordHash: '583ef6136b8e990013e35202d9e7e9577b0cb637bed69f7723e009cde0b774ca',
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
    passwordHash: '583ef6136b8e990013e35202d9e7e9577b0cb637bed69f7723e009cde0b774ca',
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
    passwordHash: '583ef6136b8e990013e35202d9e7e9577b0cb637bed69f7723e009cde0b774ca',
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
    passwordHash: '583ef6136b8e990013e35202d9e7e9577b0cb637bed69f7723e009cde0b774ca',
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
    passwordHash: '52a51b5cfd788a6d81c881ab9002deece4e1c114f514a2079d86a3c19b7ecdca',
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

export const findAccountByUsername = (username: string): DemoAccount | undefined => {
  return demoAccountsConfig.find(acc => acc.username === username && acc.isActive);
};

export const findAccountById = (id: string): DemoAccount | undefined => {
  return demoAccountsConfig.find(acc => acc.id === id && acc.isActive);
};
