import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Declaration, Chauffeur, Warehouse } from '../../types';
import { CheckCircle, XCircle, Clock, Users, MapPin, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';

const PlanificateurDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showNewChauffeur, setShowNewChauffeur] = useState(false);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [chauffeurForm, setChauffeurForm] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phone: '',
    vehicleType: '',
    employeeType: 'interne'
  });
  const [warehouseForm, setWarehouseForm] = useState({
    name: '',
    companyName: '',
    phone: '',
    address: '',
    lat: '',
    lng: ''
  });

  useEffect(() => {
    // Charger toutes les déclarations
    const allDeclarations: Declaration[] = [];
    const savedUsers = localStorage.getItem('logigrine_users') || '[]';
    const users = JSON.parse(savedUsers);
    
    users.forEach((u: any) => {
      if (u.role === 'chauffeur') {
        const userDeclarations = localStorage.getItem(`declarations_${u.id}`);
        if (userDeclarations) {
          allDeclarations.push(...JSON.parse(userDeclarations));
        }
      }
    });
    
    setDeclarations(allDeclarations);
    
    // Charger les chauffeurs
    const savedChauffeurs = localStorage.getItem('chauffeurs');
    if (savedChauffeurs) {
      setChauffeurs(JSON.parse(savedChauffeurs));
    }
    
    // Charger les entrepôts
    const savedWarehouses = localStorage.getItem('warehouses');
    if (savedWarehouses) {
      setWarehouses(JSON.parse(savedWarehouses));
    }
  }, []);

  const handleValidateDeclaration = (id: string) => {
    // Logique de validation des déclarations
    toast.success('Déclaration validée');
  };

  const handleRefuseDeclaration = (id: string) => {
    // Logique de refus des déclarations
    toast.success('Déclaration refusée');
  };

  const handleCreateChauffeur = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newChauffeur: Chauffeur = {
      id: Date.now().toString(),
      firstName: chauffeurForm.firstName,
      lastName: chauffeurForm.lastName,
      username: chauffeurForm.username,
      password: chauffeurForm.password,
      phone: chauffeurForm.phone,
      vehicleType: chauffeurForm.vehicleType as any,
      employeeType: chauffeurForm.employeeType as any,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    const updatedChauffeurs = [...chauffeurs, newChauffeur];
    setChauffeurs(updatedChauffeurs);
    localStorage.setItem('chauffeurs', JSON.stringify(updatedChauffeurs));
    
    setChauffeurForm({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      phone: '',
      vehicleType: '',
      employeeType: 'interne'
    });
    
    setShowNewChauffeur(false);
    toast.success(t('forms.success'));
  };

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newWarehouse: Warehouse = {
      id: Date.now().toString(),
      name: warehouseForm.name,
      companyId: '1',
      companyName: warehouseForm.companyName,
      phone: warehouseForm.phone,
      address: warehouseForm.address,
      coordinates: {
        lat: parseFloat(warehouseForm.lat),
        lng: parseFloat(warehouseForm.lng)
      },
      createdAt: new Date().toISOString()
    };

    const updatedWarehouses = [...warehouses, newWarehouse];
    setWarehouses(updatedWarehouses);
    localStorage.setItem('warehouses', JSON.stringify(updatedWarehouses));
    
    setWarehouseForm({
      name: '',
      companyName: '',
      phone: '',
      address: '',
      lat: '',
      lng: ''
    });
    
    setShowNewWarehouse(false);
    toast.success(t('forms.success'));
  };

  const vehicleTypes = [
    'mini_vehicule', 'fourgon', 'camion_2_5t', 'camion_3_5t', 
    'camion_5t', 'camion_7_5t', 'camion_10t', 'camion_15t', 'camion_20t'
  ];

  const stats = {
    totalDeclarations: declarations.length,
    pendingDeclarations: declarations.filter(d => d.status === 'en_cours').length,
    totalChauffeurs: chauffeurs.length,
    totalWarehouses: warehouses.length
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('nav.dashboard')} - Planificateur
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">
          Gestion des déclarations, chauffeurs et entrepôts
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalDeclarations')}
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalDeclarations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.pendingValidations')}
            </CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingDeclarations}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalChauffeurs')}
            </CardTitle>
            <Users className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.totalChauffeurs}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.totalWarehouses')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.totalWarehouses}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="declarations" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="declarations">{t('nav.declarations')}</TabsTrigger>
          <TabsTrigger value="chauffeurs">{t('nav.chauffeurs')}</TabsTrigger>
          <TabsTrigger value="warehouses">{t('nav.warehouses')}</TabsTrigger>
        </TabsList>

        {/* Déclarations */}
        <TabsContent value="declarations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Validation des déclarations</CardTitle>
              <CardDescription>
                Gérez et validez les déclarations des chauffeurs
              </CardDescription>
            </CardHeader>
            <CardContent>
              {declarations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune déclaration trouvée
                </div>
              ) : (
                <div className="space-y-4">
                  {declarations.map((declaration) => (
                    <div key={declaration.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{declaration.number}</div>
                          <div className="text-sm text-gray-500">
                            {declaration.chauffeurName} - {new Date(declaration.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                        <div className="text-sm">
                          {declaration.distance && (
                            <span className="text-gray-600">
                              {declaration.distance} km
                            </span>
                          )}
                          {declaration.deliveryFees && (
                            <span className="text-gray-600 ml-2">
                              {declaration.deliveryFees} FCFA
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={
                          declaration.status === 'en_cours' ? 'bg-orange-100 text-orange-800' :
                          declaration.status === 'valide' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }>
                          {t(`declarations.${declaration.status}`)}
                        </Badge>
                        {declaration.status === 'en_cours' && (
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              onClick={() => handleValidateDeclaration(declaration.id)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleRefuseDeclaration(declaration.id)}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chauffeurs */}
        <TabsContent value="chauffeurs" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('chauffeurs.title')}</CardTitle>
                <CardDescription>
                  Gérez les chauffeurs et leurs informations
                </CardDescription>
              </div>
              <Dialog open={showNewChauffeur} onOpenChange={setShowNewChauffeur}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('chauffeurs.new')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('chauffeurs.new')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateChauffeur} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="firstName">{t('chauffeurs.firstName')}</Label>
                        <Input
                          id="firstName"
                          value={chauffeurForm.firstName}
                          onChange={(e) => setChauffeurForm({...chauffeurForm, firstName: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lastName">{t('chauffeurs.lastName')}</Label>
                        <Input
                          id="lastName"
                          value={chauffeurForm.lastName}
                          onChange={(e) => setChauffeurForm({...chauffeurForm, lastName: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="username">Nom d'utilisateur</Label>
                      <Input
                        id="username"
                        value={chauffeurForm.username}
                        onChange={(e) => setChauffeurForm({...chauffeurForm, username: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input
                        id="password"
                        type="password"
                        value={chauffeurForm.password}
                        onChange={(e) => setChauffeurForm({...chauffeurForm, password: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('chauffeurs.phone')}</Label>
                      <Input
                        id="phone"
                        value={chauffeurForm.phone}
                        onChange={(e) => setChauffeurForm({...chauffeurForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleType">{t('chauffeurs.vehicleType')}</Label>
                      <Select value={chauffeurForm.vehicleType} onValueChange={(value) => setChauffeurForm({...chauffeurForm, vehicleType: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder={t('chauffeurs.vehicleType')} />
                        </SelectTrigger>
                        <SelectContent>
                          {vehicleTypes.map(type => (
                            <SelectItem key={type} value={type}>
                              {t(`vehicles.${type}`)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="employeeType">{t('chauffeurs.employeeType')}</Label>
                      <Select value={chauffeurForm.employeeType} onValueChange={(value) => setChauffeurForm({...chauffeurForm, employeeType: value})}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="interne">{t('chauffeurs.internal')}</SelectItem>
                          <SelectItem value="externe">{t('chauffeurs.external')}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewChauffeur(false)}>
                        {t('forms.cancel')}
                      </Button>
                      <Button type="submit">
                        {t('forms.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {chauffeurs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun chauffeur trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {chauffeurs.map((chauffeur) => (
                    <div key={chauffeur.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div>
                          <div className="font-medium">{chauffeur.firstName} {chauffeur.lastName}</div>
                          <div className="text-sm text-gray-500">@{chauffeur.username}</div>
                        </div>
                        <div className="text-sm">
                          <Badge className="mr-2">{t(`vehicles.${chauffeur.vehicleType}`)}</Badge>
                          <Badge variant="outline">
                            {chauffeur.employeeType === 'externe' ? 'TP-' : ''}{chauffeur.employeeType}
                          </Badge>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={chauffeur.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                          {chauffeur.isActive ? t('chauffeurs.active') : t('chauffeurs.inactive')}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entrepôts */}
        <TabsContent value="warehouses" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>{t('warehouses.title')}</CardTitle>
                <CardDescription>
                  Gérez les entrepôts et leurs localisations
                </CardDescription>
              </div>
              <Dialog open={showNewWarehouse} onOpenChange={setShowNewWarehouse}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('warehouses.new')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{t('warehouses.new')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateWarehouse} className="space-y-4">
                    <div>
                      <Label htmlFor="name">{t('warehouses.name')}</Label>
                      <Input
                        id="name"
                        value={warehouseForm.name}
                        onChange={(e) => setWarehouseForm({...warehouseForm, name: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="companyName">{t('warehouses.company')}</Label>
                      <Input
                        id="companyName"
                        value={warehouseForm.companyName}
                        onChange={(e) => setWarehouseForm({...warehouseForm, companyName: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">{t('warehouses.phone')}</Label>
                      <Input
                        id="phone"
                        value={warehouseForm.phone}
                        onChange={(e) => setWarehouseForm({...warehouseForm, phone: e.target.value})}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">{t('warehouses.address')}</Label>
                      <Input
                        id="address"
                        value={warehouseForm.address}
                        onChange={(e) => setWarehouseForm({...warehouseForm, address: e.target.value})}
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="lat">{t('warehouses.latitude')}</Label>
                        <Input
                          id="lat"
                          type="number"
                          step="any"
                          value={warehouseForm.lat}
                          onChange={(e) => setWarehouseForm({...warehouseForm, lat: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="lng">{t('warehouses.longitude')}</Label>
                        <Input
                          id="lng"
                          type="number"
                          step="any"
                          value={warehouseForm.lng}
                          onChange={(e) => setWarehouseForm({...warehouseForm, lng: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowNewWarehouse(false)}>
                        {t('forms.cancel')}
                      </Button>
                      <Button type="submit">
                        {t('forms.save')}
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              {warehouses.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucun entrepôt trouvé
                </div>
              ) : (
                <div className="space-y-4">
                  {warehouses.map((warehouse) => (
                    <div key={warehouse.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <MapPin className="h-5 w-5 text-green-500" />
                        <div>
                          <div className="font-medium">{warehouse.name}</div>
                          <div className="text-sm text-gray-500">{warehouse.companyName}</div>
                          <div className="text-sm text-gray-500">{warehouse.address}</div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        {warehouse.coordinates.lat.toFixed(4)}, {warehouse.coordinates.lng.toFixed(4)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanificateurDashboard;
