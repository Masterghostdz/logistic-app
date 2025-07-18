import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Company, VehicleType, Declaration } from '../types';
import { listenVehicleTypes } from '../services/vehicleTypeService';

interface SharedDataContextType {
  companies: Company[];
  vehicleTypes: VehicleType[];
  declarations: Declaration[];
  setCompanies: (companies: Company[]) => void;
  setVehicleTypes: (vehicleTypes: VehicleType[]) => void;
  setDeclarations: (declarations: Declaration[]) => void;
  addCompany: (company: Company) => void;
  addVehicleType: (vehicleType: VehicleType) => void;
  addDeclaration: (declaration: Declaration) => void;
  updateCompany: (id: string, company: Company) => void;
  updateVehicleType: (id: string, vehicleType: VehicleType) => void;
  updateDeclaration: (id: string, declaration: Declaration) => void;
  deleteCompany: (id: string) => void;
  deleteVehicleType: (id: string) => void;
  deleteDeclaration: (id: string) => void;
}

const SharedDataContext = createContext<SharedDataContextType | undefined>(undefined);

export const useSharedData = () => {
  const context = useContext(SharedDataContext);
  if (context === undefined) {
    throw new Error('useSharedData must be used within a SharedDataProvider');
  }
  return context;
};

interface SharedDataProviderProps {
  children: ReactNode;
}

// Données par défaut
const defaultCompanies: Company[] = [
  {
    id: '1',
    name: 'TechCorp Solutions',
    address: '123 Avenue Principale, Alger',
    phone: ['+213 21 12 34 56', '+213 21 12 34 57'],
    email: 'contact@techcorp.dz',
    createdAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Industries Maghreb',
    address: '456 Rue Commerce, Oran',
    phone: ['+213 41 98 76 54'],
    email: 'info@maghreb-ind.dz',
    createdAt: new Date().toISOString()
  }
];

// plus de valeurs par défaut locales pour les types de véhicule

const defaultDeclarations: Declaration[] = [];

export const SharedDataProvider: React.FC<SharedDataProviderProps> = ({ children }) => {
  // Fonction pour charger les données depuis localStorage
  const loadFromStorage = <T,>(key: string, defaultData: T): T => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : defaultData;
    } catch (error) {
      console.error(`Error loading ${key} from localStorage:`, error);
      return defaultData;
    }
  };

  // Fonction pour sauvegarder dans localStorage
  const saveToStorage = <T,>(key: string, data: T) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error saving ${key} to localStorage:`, error);
    }
  };

  const [companies, setCompaniesState] = useState<Company[]>(() => 
    loadFromStorage('companies', defaultCompanies)
  );

  const [vehicleTypes, setVehicleTypesState] = useState<VehicleType[]>([]);

  // Synchronisation temps réel des types de véhicule depuis Firestore
  useEffect(() => {
    const unsubscribe = listenVehicleTypes((types) => {
      setVehicleTypesState(types);
    });
    return () => unsubscribe && unsubscribe();
  }, []);

  const [declarations, setDeclarationsState] = useState<Declaration[]>(() => 
    loadFromStorage('declarations', defaultDeclarations)
  );

  // Sauvegarder automatiquement quand les données changent
  useEffect(() => {
    saveToStorage('companies', companies);
  }, [companies]);

  // plus de sauvegarde locale pour vehicleTypes

  useEffect(() => {
    saveToStorage('declarations', declarations);
  }, [declarations]);

  const setCompanies = (newCompanies: Company[]) => {
    setCompaniesState(newCompanies);
  };

  const setVehicleTypes = (newVehicleTypes: VehicleType[]) => {
    setVehicleTypesState(newVehicleTypes);
  };

  const setDeclarations = (newDeclarations: Declaration[]) => {
    setDeclarationsState(newDeclarations);
  };

  const addCompany = (company: Company) => {
    setCompaniesState(prev => [...prev, company]);
  };

  const addVehicleType = (vehicleType: VehicleType) => {
    setVehicleTypesState(prev => [...prev, vehicleType]);
  };

  const addDeclaration = (declaration: Declaration) => {
    setDeclarationsState(prev => [...prev, declaration]);
  };

  const updateCompany = (id: string, updatedCompany: Company) => {
    setCompaniesState(prev => prev.map(c => c.id === id ? updatedCompany : c));
  };

  const updateVehicleType = (id: string, updatedVehicleType: VehicleType) => {
    setVehicleTypesState(prev => prev.map(vt => vt.id === id ? updatedVehicleType : vt));
  };

  const updateDeclaration = (id: string, updatedDeclaration: Declaration) => {
    setDeclarationsState(prev => prev.map(d => d.id === id ? updatedDeclaration : d));
  };

  const deleteCompany = (id: string) => {
    setCompaniesState(prev => prev.filter(c => c.id !== id));
  };

  const deleteVehicleType = (id: string) => {
    setVehicleTypesState(prev => prev.filter(vt => vt.id !== id));
  };

  const deleteDeclaration = (id: string) => {
    setDeclarationsState(prev => prev.filter(d => d.id !== id));
  };

  const value = {
    companies,
    vehicleTypes,
    declarations,
    setCompanies,
    setVehicleTypes,
    setDeclarations,
    addCompany,
    addVehicleType,
    addDeclaration,
    updateCompany,
    updateVehicleType,
    updateDeclaration,
    deleteCompany,
    deleteVehicleType,
    deleteDeclaration
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};
