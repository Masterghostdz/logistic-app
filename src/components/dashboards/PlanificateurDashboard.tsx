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
import { Declaration, Chauffeur, Warehouse, User } from '../../types';
import { CheckCircle, XCircle, Clock, Users, MapPin, Plus, Edit, Trash2, FileText } from 'lucide-react';
import { toast } from 'sonner';
import OpenStreetMap from '../OpenStreetMap';

const PlanificateurDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  const [showNewChauffeur, setShowNewChauffeur] = useState(false);
  const [showNewWarehouse, setShowNewWarehouse] = useState(false);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [chauffeurForm, setChauffeurForm] = useState({
    fullName: '',
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
    
    // Charger les chauffeurs depuis les utilisateurs
    const chauffeurUsers = users.filter((u: any) => u.role === 'chauffeur');
    const chauffeursData = chauffeurUsers.map((u: any) => ({
      id: u.id,
      fullName: u.fullName,
      firstName: u.firstName,
      lastName: u.lastName,
      username: u.username,
      password: u.password || 'demo123',
      email: u.email,
      phone: u.phone,
      vehicleType: u.vehicleType || 'mini_vehicule',
      employeeType: u.employeeType || 'interne',
      isActive: u.isActive,
      createdAt: u.createdAt
    }));
    setChauffeurs(chauffeursData);
    
    // Charger les entrepôts
    const savedWarehouses = localStorage.getItem('warehouses');
    if (savedWarehouses) {
      setWarehouses(JSON.parse(savedWarehouses));
    }
  }, []);

  const handleValidateDeclaration = (id: string) => {
    const updatedDeclarations = declarations.map(d => 
      d.id === id ? { ...d, status: 'valide' as const, validatedAt: new Date().toISOString(), validatedBy: user?.fullName } : d
    );
    setDeclarations(updatedDeclarations);
    
    // Sauvegarder dans localStorage
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const userDeclarations = JSON.parse(localStorage.getItem(`declarations_${declaration.chauffeurId}`) || '[]');
      const updatedUserDeclarations = userDeclarations.map((d: Declaration) => 
        d.id === id ? { ...d, status: 'valide', validatedAt: new Date().toISOString(), validatedBy: user?.fullName } : d
      );
      localStorage.setItem(`declarations_${declaration.chauffeurId}`, JSON.stringify(updatedUserDeclarations));
    }
    
    toast.success('Déclaration validée');
  };

  const handleRefuseDeclaration = (id: string) => {
    const reason = prompt('Raison du refus:');
    if (!reason) return;
    
    const updatedDeclarations = declarations.map(d => 
      d.id === id ? { ...d, status: 'refuse' as const, refusalReason: reason } : d
    );
    setDeclarations(updatedDeclarations);
    
    // Sauvegarder dans localStorage
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const userDeclarations = JSON.parse(localStorage.getItem(`declarations_${declaration.chauffeurId}`) || '[]');
      const updatedUserDeclarations = userDeclarations.map((d: Declaration) => 
        d.id === id ? { ...d, status: 'refuse', refusalReason: reason } : d
      );
      localStorage.setItem(`declarations_${declaration.chauffeurId}`, JSON.stringify(updatedUserDeclarations));
    }
    
    toast.success('Déclaration refusée');
  };

  const handleDeleteDeclaration = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) return;
    
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      // Supprimer de la liste locale
      setDeclarations(declarations.filter(d => d.id !== id));
      
      // Supprimer du localStorage du chauffeur
      const userDeclarations = JSON.parse(localStorage.getItem(`declarations_${declaration.chauffeurId}`) || '[]');
      const updatedUserDeclarations = userDeclarations.filter((d: Declaration) => d.id !== id);
      localStorage.setItem(`declarations_${declaration.chauffeurId}`, JSON.stringify(updatedUserDeclarations));
      
      toast.success('Déclaration supprimée');
    }
  };

  const handleCreateChauffeur = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Safer name splitting to avoid recursion
    const nameParts = chauffeurForm.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    const newChauffeurId = Date.now().toString();
    
    console.log('Creating chauffeur with data:', {
      fullName: chauffeurForm.fullName,
      firstName,
      lastName,
      username: chauffeurForm.username,
      vehicleType: chauffeurForm.vehicleType,
      employeeType: chauffeurForm.employeeType
    });
    
    // Créer le chauffeur dans la liste des chauffeurs  
    const newChauffeur: Chauffeur = {
      id: newChauffeurId,
      fullName: chauffeurForm.fullName,
      firstName,
      lastName,
      username: chauffeurForm.username,
      password: chauffeurForm.password,
      phone: chauffeurForm.phone,
      vehicleType: chauffeurForm.vehicleType as any,
      employeeType: chauffeurForm.employeeType as any,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    // Créer l'utilisateur dans la liste des utilisateurs
    const newUser: User = {
      id: newChauffeurId,
      username: chauffeurForm.username,
      role: 'chauffeur',
      fullName: chauffeurForm.fullName,
      firstName,
      lastName,
      phone: chauffeurForm.phone,
      createdAt: new Date().toISOString(),
      isActive: true,
      password: chauffeurForm.password,
      vehicleType: chauffeurForm.vehicleType as any,
      employeeType: chauffeurForm.employeeType as any
    };

    console.log('New chauffeur object:', newChauffeur);
    console.log('New user object:', newUser);

    try {
      // Mettre à jour les chauffeurs
      const updatedChauffeurs = [...chauffeurs, newChauffeur];
      setChauffeurs(updatedChauffeurs);
      
      // Mettre à jour les utilisateurs
      const users = JSON.parse(localStorage.getItem('logigrine_users') || '[]');
      const updatedUsers = [...users, newUser];
      localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
      
      console.log('Updated users in localStorage:', updatedUsers);
      
      // Reset form
      setChauffeurForm({
        fullName: '',
        username: '',
        password: '',
        phone: '',
        vehicleType: '',
        employeeType: 'interne'
      });
      
      setShowNewChauffeur(false);
      toast.success('Chauffeur créé avec succès');
      
    } catch (error) {
      console.error('Error creating chauffeur:', error);
      toast.error('Erreur lors de la création du chauffeur');
    }
  };

  const handleEditChauffeur = (chauffeur: Chauffeur) => {
    console.log('Editing chauffeur:', chauffeur);
    setEditingChauffeur(chauffeur);
    setChauffeurForm({
      fullName: chauffeur.fullName,
      username: chauffeur.username,
      password: chauffeur.password,
      phone: chauffeur.phone,
      vehicleType: chauffeur.vehicleType,
      employeeType: chauffeur.employeeType
    });
    setShowNewChauffeur(true);
  };

  const handleUpdateChauffeur = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingChauffeur) return;
    
    // Safer name splitting to avoid recursion
    const nameParts = chauffeurForm.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';
    
    console.log('Updating chauffeur with data:', {
      fullName: chauffeurForm.fullName,
      firstName,
      lastName,
      username: chauffeurForm.username,
      vehicleType: chauffeurForm.vehicleType,
      employeeType: chauffeurForm.employeeType
    });
    
    try {
      // Mettre à jour le chauffeur
      const updatedChauffeur: Chauffeur = {
        ...editingChauffeur,
        fullName: chauffeurForm.fullName,
        firstName,
        lastName,
        username: chauffeurForm.username,
        password: chauffeurForm.password,
        phone: chauffeurForm.phone,
        vehicleType: chauffeurForm.vehicleType as any,
        employeeType: chauffeurForm.employeeType as any,
      };

      // Mettre à jour dans la liste des chauffeurs
      const updatedChauffeurs = chauffeurs.map(c => 
        c.id === editingChauffeur.id ? updatedChauffeur : c
      );
      setChauffeurs(updatedChauffeurs);
      
      // Mettre à jour dans la liste des utilisateurs
      const users = JSON.parse(localStorage.getItem('logigrine_users') || '[]');
      const updatedUsers = users.map((u: any) => 
        u.id === editingChauffeur.id ? {
          ...u,
          fullName: chauffeurForm.fullName,
          firstName,
          lastName,
          username: chauffeurForm.username,
          password: chauffeurForm.password,
          phone: chauffeurForm.phone,
          vehicleType: chauffeurForm.vehicleType,
          employeeType: chauffeurForm.employeeType
        } : u
      );
      localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
      
      console.log('Updated users in localStorage:', updatedUsers);
      
      // Reset form
      setChauffeurForm({
        fullName: '',
        username: '',
        password: '',
        phone: '',
        vehicleType: '',
        employeeType: 'interne'
      });
      
      setEditingChauffeur(null);
      setShowNewChauffeur(false);
      toast.success('Chauffeur modifié avec succès');
      
    } catch (error) {
      console.error('Error updating chauffeur:', error);
      toast.error('Erreur lors de la modification du chauffeur');
    }
  };

  const handleDeleteChauffeur = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce chauffeur ?')) return;
    
    // Supprimer de la liste des chauffeurs
    setChauffeurs(chauffeurs.filter(c => c.id !== id));
    
    // Supprimer de la liste des utilisateurs
    const users = JSON.parse(localStorage.getItem('logigrine_users') || '[]');
    const updatedUsers = users.filter((u: any) => u.id !== id);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    
    // Supprimer les déclarations du chauffeur
    localStorage.removeItem(`declarations_${id}`);
    setDeclarations(declarations.filter(d => d.chauffeurId !== id));
    
    toast.success('Chauffeur supprimé');
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="declarations">{t('nav.declarations')}</TabsTrigger>
          <TabsTrigger value="chauffeurs">{t('nav.chauffeurs')}</TabsTrigger>
          <TabsTrigger value="warehouses">{t('nav.warehouses')}</TabsTrigger>
          <TabsTrigger value="tracage">Traçage</TabsTrigger>
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
                        <div className="flex gap-1">
                          {declaration.status === 'en_cours' && (
                            <>
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
                            </>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteDeclaration(declaration.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
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
                    {editingChauffeur ? 'Modifier chauffeur' : t('chauffeurs.new')}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingChauffeur ? 'Modifier chauffeur' : t('chauffeurs.new')}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={editingChauffeur ? handleUpdateChauffeur : handleCreateChauffeur} className="space-y-4">
                    <div>
                      <Label htmlFor="fullName">Nom & Prénom</Label>
                      <Input
                        id="fullName"
                        value={chauffeurForm.fullName}
                        onChange={(e) => setChauffeurForm({...chauffeurForm, fullName: e.target.value})}
                        required
                        placeholder="Jean Martin"
                      />
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
                      <Button type="button" variant="outline" onClick={() => {
                        setShowNewChauffeur(false);
                        setEditingChauffeur(null);
                        setChauffeurForm({
                          fullName: '',
                          username: '',
                          password: '',
                          phone: '',
                          vehicleType: '',
                          employeeType: 'interne'
                        });
                      }}>
                        {t('forms.cancel')}
                      </Button>
                      <Button type="submit">
                        {editingChauffeur ? 'Modifier' : t('forms.save')}
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
                          <div className="font-medium">{chauffeur.fullName}</div>
                          <div className="text-sm text-gray-500">@{chauffeur.username}</div>
                          <div className="text-sm text-gray-500">{chauffeur.phone}</div>
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
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditChauffeur(chauffeur)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => handleDeleteChauffeur(chauffeur.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
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

        {/* Traçage */}
        <TabsContent value="tracage" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Gestion d'entrepôts</CardTitle>
                <CardDescription>
                  Visualisez tous les entrepôts sur la carte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-96">
                  <OpenStreetMap warehouses={warehouses} />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Traçage Chauffeur</CardTitle>
                <CardDescription>
                  Suivi en temps réel des chauffeurs
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8 text-gray-500">
                  <div className="text-2xl mb-2">🚧</div>
                  <div>Coming Soon</div>
                  <div className="text-sm">Fonctionnalité de traçage en développement</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default PlanificateurDashboard;
