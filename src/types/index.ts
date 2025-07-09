export interface User {
  id: string;
  username: string;
  role: 'chauffeur' | 'planificateur' | 'financier' | 'financier_unite' | 'admin';
  firstName: string;
  lastName: string;
  fullName: string;
  phone?: string;
  password: string;
  createdAt: string;
}

export interface Chauffeur {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  password: string;
  phone: string;
  vehicleType: string;
  employeeType: 'interne' | 'externe';
  isActive: boolean;
  createdAt: string;
}

export interface Declaration {
  id: string;
  number: string;
  programNumber: string;
  year: string;
  month: string;
  chauffeurId: string;
  chauffeurName: string;
  distance?: number;
  deliveryFees?: number;
  notes?: string;
  photos?: string[];
  status: 'en_cours' | 'valide' | 'refuse';
  createdAt: string;
  validatedAt?: string;
  validatedBy?: string;
  refusalReason?: string;
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

export interface Company {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  email?: string;
  createdAt: string;
}

export interface VehicleType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
}
