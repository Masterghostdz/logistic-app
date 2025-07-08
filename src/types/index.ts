
export interface User {
  id: string;
  username: string;
  role: 'chauffeur' | 'planificateur' | 'financier' | 'financier_unite' | 'admin';
  firstName: string;
  lastName: string;
  email?: string; // Optional for chauffeur accounts
  phone: string;
  avatar?: string;
  createdAt: string;
  isActive: boolean;
  password?: string; // For password management
}

export interface Declaration {
  id: string;
  number: string; // Format: DCP/AA/MM/XXXX
  programNumber: string; // XXXX part that user enters manually
  year: string; // AA part (24,25,26,27,28)
  month: string; // MM part (01-12)
  chauffeurId: string;
  chauffeurName: string;
  distance?: number;
  deliveryFees?: number;
  notes: string;
  photos: string[];
  status: 'en_cours' | 'valide' | 'refuse';
  createdAt: string;
  validatedAt?: string;
  validatedBy?: string;
  refusalReason?: string;
}

export interface Chauffeur {
  id: string;
  firstName: string;
  lastName: string;
  username: string;
  password: string;
  email?: string;
  phone: string;
  vehicleType: 'mini_vehicule' | 'fourgon' | 'camion_2_5t' | 'camion_3_5t' | 'camion_5t' | 'camion_7_5t' | 'camion_10t' | 'camion_15t' | 'camion_20t';
  employeeType: 'interne' | 'externe';
  isActive: boolean;
  createdAt: string;
}

export interface Company {
  id: string;
  name: string;
  createdAt: string;
}

export interface Warehouse {
  id: string;
  name: string;
  companyId: string;
  companyName: string;
  phone: string;
  address: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

export interface FinancialRecord {
  id: string;
  number: string;
  type: 'remboursement' | 'reglement';
  programNumber: string;
  destinationUnit: 'cph_nord' | 'cph_sud' | 'cph_est' | 'cph_ouest' | 'cph_centre';
  amount: number; // en FCFA
  description: string;
  photos: string[];
  status: 'en_attente' | 'traite';
  createdAt: string;
  processedAt?: string;
  processedBy?: string;
}

export interface AuthContextType {
  user: User | null;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  changePassword: (oldPassword: string, newPassword: string) => Promise<boolean>;
  isAuthenticated: boolean;
}

export interface Settings {
  language: 'fr' | 'en' | 'ar';
  theme: 'light' | 'dark';
}

export type TranslationKey = string;
export type Translations = Record<string, Record<string, string>>;
