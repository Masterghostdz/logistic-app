import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

import { Company, VehicleType, Declaration } from '../types';
import * as declarationService from '../services/declarationService';

interface SharedDataContextType {
  companies: Company[];
  vehicleTypes: VehicleType[];
  declarations: Declaration[];
  setCompanies: (companies: Company[]) => void;
  setVehicleTypes: (vehicleTypes: VehicleType[]) => void;
  setDeclarations: (declarations: Declaration[]) => void;
  addCompany: (company: Company) => void;
  addVehicleType: (vehicleType: VehicleType) => void;
  addDeclaration: (declaration: Declaration) => Promise<string | undefined>;
  updateCompany: (id: string, company: Company) => void;
  updateVehicleType: (id: string, vehicleType: VehicleType) => void;
  updateDeclaration: (id: string, declaration: Declaration) => Promise<void>;
  deleteCompany: (id: string) => void;
  deleteVehicleType: (id: string) => void;
  deleteDeclaration: (id: string) => Promise<void>;
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
const defaultCompanies: Company[] = [];
const defaultVehicleTypes: VehicleType[] = [];
const defaultDeclarations: Declaration[] = [];

export const SharedDataProvider: React.FC<SharedDataProviderProps> = ({ children }) => {
  const [companies, setCompaniesState] = useState<Company[]>([]);

  // Synchronisation Firestore pour les sociétés (exactement comme AdminDashboard)
  useEffect(() => {
    let unsubscribe: any;
    const listen = async () => {
      const { listenCompanies } = await import('../services/companyService');
      unsubscribe = listenCompanies((cloudCompanies: Company[]) => {
        setCompaniesState(cloudCompanies);
      });
    };
    listen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const [vehicleTypes, setVehicleTypesState] = useState<VehicleType[]>(defaultVehicleTypes);

  // Synchronisation Firestore pour les types de véhicules (temps réel)
  useEffect(() => {
    let unsubscribe: any;
    const listen = async () => {
      const { listenVehicleTypes } = await import('../services/vehicleTypeService');
      unsubscribe = listenVehicleTypes((cloudVehicleTypes: VehicleType[]) => {
        setVehicleTypesState(cloudVehicleTypes);
      });
    };
    listen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  const [declarations, setDeclarationsState] = useState<Declaration[]>(defaultDeclarations);

  // Synchronisation Firestore pour les déclarations (temps réel)
  useEffect(() => {
    let unsubscribe: any;
    const listen = async () => {
      if (declarationService.listenDeclarations) {
        unsubscribe = declarationService.listenDeclarations((cloudDeclarations: Declaration[]) => {
          setDeclarationsState(cloudDeclarations);
        });
      }
    };
    listen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

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

  const addDeclaration = async (declaration: Declaration) => {
    // Ajout Firestore, puis retour de l'ID généré pour cohérence
    try {
      const docRef = await declarationService.addDeclaration(declaration);
      // On ne modifie pas l'état local ici, la synchro temps réel s'en charge
      return docRef.id;
    } catch (error) {
      console.error('Erreur lors de l\'ajout de la déclaration dans Firestore:', error);
      // Optionnel: afficher une notification d'erreur
      return undefined;
    }
  };

  const updateCompany = (id: string, updatedCompany: Company) => {
    setCompaniesState(prev => prev.map(c => c.id === id ? updatedCompany : c));
  };

  const updateVehicleType = (id: string, updatedVehicleType: VehicleType) => {
    setVehicleTypesState(prev => prev.map(vt => vt.id === id ? updatedVehicleType : vt));
  };

  const updateDeclaration = async (id: string, updatedDeclaration: Declaration) => {
    try {
      // Optimistically update local state so UI reflects changes immediately
      setDeclarationsState(prev => prev.map(d => d.id === id ? updatedDeclaration : d));
      await declarationService.updateDeclaration(id, updatedDeclaration);
      // The realtime listener will also sync state; no further action required
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la déclaration dans Firestore:', error);
      // Optionally, we could refetch or revert the optimistic update here
    }
  };

  const deleteCompany = (id: string) => {
    setCompaniesState(prev => prev.filter(c => c.id !== id));
  };

  const deleteVehicleType = (id: string) => {
    setVehicleTypesState(prev => prev.filter(vt => vt.id !== id));
  };

  const deleteDeclaration = async (id: string) => {
    try {
      await declarationService.deleteDeclaration(id);
      setDeclarationsState(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      console.error("Erreur lors de la suppression de la déclaration dans Firestore:", error);
      // Optionnel: afficher une notification d'erreur
    }
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
