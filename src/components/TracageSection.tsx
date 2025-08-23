
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
                <div>
                  <Label>Nom de l'entrepôt</Label>
                  <Input
                    type="text"
                    value={newWarehouse.name}
                    onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                    placeholder="Nom de l'entrepôt"
                    required
                  />
                </div>
                <div>
                  <Label>Société</Label>
                  <Select value={newWarehouse.companyId} onValueChange={handleCompanyChange} required={true}>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une société" />
                    </SelectTrigger>
                    <SelectContent>
                      {companies.map(company => (
                        <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Adresse</Label>
                  <Input
                    type="text"
                    value={newWarehouse.address}
                    onChange={e => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                    placeholder="Adresse"
                    required
                  />
                </div>
                <div>
                  <Label>Téléphones</Label>
                  <PhoneNumbersField
                    phones={newWarehouse.phone}
                    onChange={phones => setNewWarehouse({ ...newWarehouse, phone: phones })}
                  />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <Label>Latitude</Label>
                    <Input
                      type="number"
                      value={newWarehouse.lat}
                      onChange={e => setNewWarehouse({ ...newWarehouse, lat: e.target.value })}
                      placeholder="Latitude"
                      required
                    />
                  </div>
                  <div className="flex-1">
                    <Label>Longitude</Label>
                    <Input
                      type="number"
                      value={newWarehouse.lng}
                      onChange={e => setNewWarehouse({ ...newWarehouse, lng: e.target.value })}
                      placeholder="Longitude"
                      required
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 pt-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateWarehouse(false)}>
                    Annuler
                  </Button>
                  <Button type="submit">
                    Enregistrer
                  </Button>
                </div>
              </form>
            </CardContent>
          </div>
        </div>
      )}
      <div className="space-y-6 p-2 md:p-6 max-w-full overflow-hidden flex flex-col justify-center">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold text-center w-full">Traçage</h2>
        </div>
        {/* Responsive layout: always stacked on mobile, side by side on desktop */}
        <div className={isMobile ? "flex flex-col gap-6 w-full" : "flex flex-row gap-6 w-full"}>
          {/* Map section */}
          <div className={isMobile ? "w-full" : "w-1/2"}>
            {isMobile ? (
              <MobileOpenStreetMap warehouses={warehouses} />
            ) : (
              <OpenStreetMap warehouses={warehouses} />
            )}
          </div>
          {/* Warehouse list section */}
          <div className={isMobile ? "w-full" : "w-1/2"}>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
              <h3 className="text-base md:text-lg font-semibold text-center w-full">Entrepôts synchronisés</h3>
              <Button 
                onClick={() => setShowCreateWarehouse(!showCreateWarehouse)} 
                className="flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto justify-center"
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
                      <div className="font-semibold">{wh.name}</div>
                      <div className="text-xs text-muted-foreground">{wh.address}</div>
                      <div className="flex gap-2 text-xs">
                        <Badge>{wh.companyName}</Badge>
                        <span>Lat: {wh.coordinates.lat}</span>
                        <span>Lng: {wh.coordinates.lng}</span>
                      </div>
                      <div className="text-xs">Téléphones: {wh.phone?.join(', ')}</div>
                      <div className="text-xs">Créé le: {new Date(wh.createdAt).toLocaleString()}</div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default TracageSection;
