
import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Company, VehicleType } from '../types';

interface SharedDataContextType {
  companies: Company[];
  vehicleTypes: VehicleType[];
  setCompanies: (companies: Company[]) => void;
  setVehicleTypes: (vehicleTypes: VehicleType[]) => void;
  addCompany: (company: Company) => void;
  addVehicleType: (vehicleType: VehicleType) => void;
  updateCompany: (id: string, company: Company) => void;
  updateVehicleType: (id: string, vehicleType: VehicleType) => void;
  deleteCompany: (id: string) => void;
  deleteVehicleType: (id: string) => void;
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

export const SharedDataProvider: React.FC<SharedDataProviderProps> = ({ children }) => {
  const [companies, setCompaniesState] = useState<Company[]>([
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
  ]);

  const [vehicleTypes, setVehicleTypesState] = useState<VehicleType[]>([
    {
      id: '1',
      name: 'Camion 3.5T',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Camionnette',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Utilitaire',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Poids Lourd',
      createdAt: new Date().toISOString()
    }
  ]);

  const setCompanies = (newCompanies: Company[]) => {
    setCompaniesState(newCompanies);
  };

  const setVehicleTypes = (newVehicleTypes: VehicleType[]) => {
    setVehicleTypesState(newVehicleTypes);
  };

  const addCompany = (company: Company) => {
    setCompaniesState(prev => [...prev, company]);
  };

  const addVehicleType = (vehicleType: VehicleType) => {
    setVehicleTypesState(prev => [...prev, vehicleType]);
  };

  const updateCompany = (id: string, updatedCompany: Company) => {
    setCompaniesState(prev => prev.map(c => c.id === id ? updatedCompany : c));
  };

  const updateVehicleType = (id: string, updatedVehicleType: VehicleType) => {
    setVehicleTypesState(prev => prev.map(vt => vt.id === id ? updatedVehicleType : vt));
  };

  const deleteCompany = (id: string) => {
    setCompaniesState(prev => prev.filter(c => c.id !== id));
  };

  const deleteVehicleType = (id: string) => {
    setVehicleTypesState(prev => prev.filter(vt => vt.id !== id));
  };

  const value = {
    companies,
    vehicleTypes,
    setCompanies,
    setVehicleTypes,
    addCompany,
    addVehicleType,
    updateCompany,
    updateVehicleType,
    deleteCompany,
    deleteVehicleType
  };

  return (
    <SharedDataContext.Provider value={value}>
      {children}
    </SharedDataContext.Provider>
  );
};
