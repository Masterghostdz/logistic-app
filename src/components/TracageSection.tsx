import React, { useState } from 'react';
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
  const { companies } = useSharedData();
  const isMobile = useIsMobile();
  
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Entrepôt Principal Alger',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: ['+213 21 12 34 56'],
      address: '123 Rue des Entrepreneurs, Alger',
      coordinates: { lat: 36.7538, lng: 3.0588 },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Entrepôt Oran',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: ['+213 41 98 76 54'],
      address: '456 Boulevard Commercial, Oran',
      coordinates: { lat: 35.6969, lng: -0.6331 },
      createdAt: new Date().toISOString()
    }
  ]);

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

    setWarehouses([...warehouses, warehouse]);
    setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', lat: '', lng: '' });
    setShowCreateWarehouse(false);
    toast.success('Entrepôt créé avec succès');
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
    <div className="space-y-6 p-2 md:p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Traçage</h2>
      </div>

      <Tabs defaultValue="entrepots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrepots" className="flex items-center gap-2 text-xs md:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entrepôts</span>
            <span className="sm:hidden">Dépôts</span>
          </TabsTrigger>
          <TabsTrigger value="chauffeurs" className="flex items-center gap-2 text-xs md:text-sm">
            <Truck className="h-4 w-4" />
            Chauffeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entrepots" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold">Gestion des Entrepôts</h3>
            <Button 
              onClick={() => setShowCreateWarehouse(!showCreateWarehouse)} 
              className="flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un entrepôt</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>

          {showCreateWarehouse && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg">Créer un nouvel entrepôt</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWarehouse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm">Nom de l'entrepôt</Label>
                      <Input
                        id="name"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm">Société</Label>
                      <Select value={newWarehouse.companyId} onValueChange={handleCompanyChange} required>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Sélectionner une société" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id} className="text-sm">
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <PhoneNumbersField
                        label="Numéros de téléphone"
                        phones={newWarehouse.phone}
                        onChange={(phones) => setNewWarehouse({ ...newWarehouse, phone: phones })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-sm">Adresse</Label>
                      <Input
                        id="address"
                        value={newWarehouse.address}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lat" className="text-sm">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={newWarehouse.lat}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lat: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng" className="text-sm">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={newWarehouse.lng}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lng: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" size={isMobile ? "sm" : "default"} className="text-sm">Créer</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setShowCreateWarehouse(false)}
                      size={isMobile ? "sm" : "default"}
                      className="text-sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4 order-2 lg:order-1">
              <h4 className="font-semibold text-sm md:text-base">Liste des Entrepôts</h4>
              <div className="max-h-80 md:max-h-96 overflow-y-auto space-y-3">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold truncate text-sm md:text-base">{warehouse.name}</h5>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{warehouse.companyName}</p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{warehouse.address}</p>
                          <div className="text-xs md:text-sm text-gray-500">
                            {warehouse.phone.map((phone, index) => (
                              <div key={index} className="truncate">{phone}</div>
                            ))}
                          </div>
                        </div>
                        <Badge variant="outline" className="bg-green-50 text-green-700 ml-2 flex-shrink-0 text-xs">
                          <MapPin className="h-3 w-3 mr-1" />
                          Actif
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div className="min-h-0 order-1 lg:order-2">
              <h4 className="font-semibold mb-4 text-sm md:text-base">Carte des Entrepôts</h4>
              <div className="h-64 sm:h-80 lg:h-[500px] w-full">
                {isMobile ? (
                  <MobileOpenStreetMap 
                    warehouses={warehouses}
                    chauffeurs={chauffeurs}
                    height="100%"
                  />
                ) : (
                  <OpenStreetMap 
                    warehouses={warehouses}
                    chauffeurs={chauffeurs}
                    height="100%"
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chauffeurs" className="space-y-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Truck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
              <p className="text-gray-500 text-sm px-4">La fonctionnalité de traçage des chauffeurs sera bientôt disponible.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TracageSection;
