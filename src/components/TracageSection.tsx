import WarehouseTable from "./dashboards/WarehouseTable";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { MapPin, Truck, Plus, Building2 } from 'lucide-react';
import OpenStreetMap from './OpenStreetMap';
import MobileOpenStreetMap from './MobileOpenStreetMap';
import { Warehouse, Chauffeur } from '../types';
import { useSharedData } from '../contexts/SharedDataContext';
import { useIsMobile } from '../hooks/use-mobile';
import PhoneNumbersField from './PhoneNumbersField';

const TracageSection = () => {
  const sharedData = useSharedData();
  const companies = sharedData.companies || [];
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [showMapModal, setShowMapModal] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  useEffect(() => {
    import('../services/warehouseService').then(mod => {
      mod.getWarehouses().then((data: Warehouse[]) => setWarehouses(data));
    });
  }, []);
  const [chauffeurs] = useState<Chauffeur[]>([
    {
      id: '1',
      firstName: 'Ahmed',
      lastName: 'Benali',
      fullName: 'Ahmed Benali',
      username: 'abenali',
      password: 'demo123',
      phone: ['+213 55 12 34 56'],
      vehicleType: 'Camion 3.5T',
      employeeType: 'interne',
      isActive: true,
      createdAt: new Date().toISOString(),
      coordinates: { lat: 36.7750, lng: 3.0594 }
    },
    {
      id: '2',
      firstName: 'Mohamed',
      lastName: 'Khedira',
      fullName: 'Mohamed Khedira',
      username: 'mkhedira',
      password: 'demo123',
      phone: ['+213 66 98 76 54'],
      vehicleType: 'Camionnette',
      employeeType: 'externe',
      isActive: true,
      createdAt: new Date().toISOString(),
      coordinates: { lat: 35.7000, lng: -0.6300 }
    }
  ]);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    companyId: '',
    companyName: '',
    phone: [] as string[],
    address: '',
    lat: '',
    lng: ''
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name || !newWarehouse.companyId || !newWarehouse.address || !newWarehouse.lat || !newWarehouse.lng) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const selectedCompany = companies.find(c => c.id === newWarehouse.companyId);
    if (!selectedCompany) {
      toast.error('Veuillez sélectionner une société');
      return;
    }
    const warehouse: Warehouse = {
      id: Date.now().toString(),
      name: newWarehouse.name,
      companyId: newWarehouse.companyId,
      companyName: selectedCompany.name,
      phone: newWarehouse.phone,
      address: newWarehouse.address,
      coordinates: {
        lat: parseFloat(newWarehouse.lat),
        lng: parseFloat(newWarehouse.lng)
      },
      createdAt: new Date().toISOString()
    };
    // TODO: Ajouter l'entrepôt à Firebase ici
    setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', lat: '', lng: '' });
    setShowCreateWarehouse(false);
    toast.success('Entrepôt créé avec succès (Firebase)');
  };

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find(c => c.id === companyId);
    setNewWarehouse({
      ...newWarehouse,
      companyId,
      companyName: selectedCompany?.name || ''
    });
  };

  return (
    <>
      {/* Modal/Dialog pour le formulaire de création d'entrepôt */}
      {showCreateWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-muted rounded-lg shadow-lg p-4 max-w-[95vw] w-[400px] relative">
            <Button onClick={() => setShowCreateWarehouse(false)} className="absolute top-2 right-2" size="icon">✕</Button>
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg">Créer un nouvel entrepôt</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWarehouse} className="space-y-4">
                {/* ...existing code... */}
              </form>
            </CardContent>
          </div>
        </div>
      )}
      {/* Section Tracage classique, vertical pour tous les modes */}
      <div className="space-y-6 p-2 md:p-6 max-w-full overflow-hidden flex flex-col justify-center">
        <div className="w-full">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Liste des Entrepôts</h2>
          <div className="flex flex-row justify-between items-center mb-4">
            <Button 
              onClick={() => setShowCreateWarehouse(!showCreateWarehouse)} 
              className="flex items-center gap-2 text-xs md:text-sm"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un entrepôt</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>
          <div className="space-y-2">
            {warehouses.length === 0 ? (
              <div className="text-muted-foreground text-sm">Aucun entrepôt synchronisé.</div>
            ) : (
              warehouses.map(wh => (
                <Card key={wh.id} className="p-2">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between font-semibold whitespace-nowrap">
                      <span className="text-[10px] md:text-xs">{wh.name}</span>
                      {wh.isActive ? (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-300 shadow">Actif</span>
                      ) : (
                        <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-300 shadow">Inactif</span>
                      )}
                    </div>
                    <div className="flex gap-2 text-xs items-center mt-1">
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 px-2 py-1 rounded">{wh.companyName}</Badge>
                    </div>
                    {wh.phone && wh.phone.length > 0 && (
                      <div className="text-xs font-mono text-gray-700 mt-1">{wh.phone[0]}</div>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        </div>
        <div className="w-full mt-8">
          <h2 className="text-xl md:text-2xl font-bold mb-4">Carte des Entrepôts</h2>
          <div className="w-full h-[400px] mb-6">
            {isMobile ? (
              <MobileOpenStreetMap warehouses={warehouses} />
            ) : (
              <OpenStreetMap warehouses={warehouses} />
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default TracageSection;
