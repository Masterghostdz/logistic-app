
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { MapPin, Truck, Plus, Building2 } from 'lucide-react';
import OpenStreetMap from './OpenStreetMap';
import { Warehouse, Chauffeur } from '../types';

const TracageSection = () => {
  const [warehouses, setWarehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Entrepôt Principal Alger',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: '+213 21 12 34 56',
      address: '123 Rue des Entrepreneurs, Alger',
      coordinates: { lat: 36.7538, lng: 3.0588 },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Entrepôt Oran',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: '+213 41 98 76 54',
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
      phone: '+213 55 12 34 56',
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
      phone: '+213 66 98 76 54',
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
    companyName: '',
    phone: '',
    address: '',
    lat: '',
    lng: ''
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newWarehouse.name || !newWarehouse.companyName || !newWarehouse.address || !newWarehouse.lat || !newWarehouse.lng) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    const warehouse: Warehouse = {
      id: Date.now().toString(),
      name: newWarehouse.name,
      companyId: '1',
      companyName: newWarehouse.companyName,
      phone: newWarehouse.phone,
      address: newWarehouse.address,
      coordinates: {
        lat: parseFloat(newWarehouse.lat),
        lng: parseFloat(newWarehouse.lng)
      },
      createdAt: new Date().toISOString()
    };

    setWarehouses([...warehouses, warehouse]);
    setNewWarehouse({ name: '', companyName: '', phone: '', address: '', lat: '', lng: '' });
    setShowCreateWarehouse(false);
    toast.success('Entrepôt créé avec succès');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Traçage</h2>
      </div>

      <Tabs defaultValue="entrepots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrepots" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Entrepôts
          </TabsTrigger>
          <TabsTrigger value="chauffeurs" className="flex items-center gap-2">
            <Truck className="h-4 w-4" />
            Chauffeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entrepots" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Gestion des Entrepôts</h3>
            <Button onClick={() => setShowCreateWarehouse(!showCreateWarehouse)} className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Créer un entrepôt
            </Button>
          </div>

          {showCreateWarehouse && (
            <Card>
              <CardHeader>
                <CardTitle>Créer un nouvel entrepôt</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateWarehouse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nom de l'entrepôt</Label>
                      <Input
                        id="name"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName">Nom de la société</Label>
                      <Input
                        id="companyName"
                        value={newWarehouse.companyName}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, companyName: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newWarehouse.phone}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">Adresse</Label>
                      <Input
                        id="address"
                        value={newWarehouse.address}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lat">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={newWarehouse.lat}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lat: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={newWarehouse.lng}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lng: e.target.value })}
                        required
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit">Créer</Button>
                    <Button type="button" variant="outline" onClick={() => setShowCreateWarehouse(false)}>
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-semibold">Liste des Entrepôts</h4>
              {warehouses.map((warehouse) => (
                <Card key={warehouse.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h5 className="font-semibold">{warehouse.name}</h5>
                        <p className="text-sm text-gray-600">{warehouse.companyName}</p>
                        <p className="text-sm text-gray-500">{warehouse.address}</p>
                        <p className="text-sm text-gray-500">{warehouse.phone}</p>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        <MapPin className="h-3 w-3 mr-1" />
                        Actif
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Carte des Entrepôts</h4>
              <OpenStreetMap 
                warehouses={warehouses}
                chauffeurs={chauffeurs}
                height="500px"
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chauffeurs" className="space-y-4">
          <div className="flex justify-center items-center h-64">
            <div className="text-center">
              <Truck className="h-16 w-16 mx-auto text-gray-400 mb-4" />
              <h3 className="text-xl font-semibold text-gray-600 mb-2">Coming Soon</h3>
              <p className="text-gray-500">La fonctionnalité de traçage des chauffeurs sera bientôt disponible.</p>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TracageSection;
