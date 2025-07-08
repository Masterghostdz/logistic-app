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
import { User, VehicleType, Company } from '../../types';
import { Plus, Users, Settings, Shield, Activity, Edit, Trash2, Search, Filter, Truck, Building } from 'lucide-react';
import { toast } from 'sonner';
import PasswordChangeDialog from '../PasswordChangeDialog';
import SearchAndFilter from '../SearchAndFilter';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [showNewVehicleType, setShowNewVehicleType] = useState(false);
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [userForm, setUserForm] = useState({
    username: '',
    fullName: '',
    phone: '',
    role: 'chauffeur',
    password: '',
    vehicleType: '',
    employeeType: 'interne'
  });
  const [vehicleTypeForm, setVehicleTypeForm] = useState({
    name: ''
  });
  const [companyForm, setCompanyForm] = useState({
    name: ''
  });

  useEffect(() => {
    const savedUsers = localStorage.getItem('logigrine_users');
    if (savedUsers) {
      const loadedUsers = JSON.parse(savedUsers);
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
    }

    const savedVehicleTypes = localStorage.getItem('logigrine_vehicle_types');
    if (savedVehicleTypes) {
      setVehicleTypes(JSON.parse(savedVehicleTypes));
    } else {
      // Types de véhicules par défaut
      const defaultVehicleTypes = [
        { id: '1', name: 'Mini véhicule', createdAt: new Date().toISOString() },
        { id: '2', name: 'Fourgon', createdAt: new Date().toISOString() },
        { id: '3', name: 'Camion 2.5T', createdAt: new Date().toISOString() },
        { id: '4', name: 'Camion 3.5T', createdAt: new Date().toISOString() },
        { id: '5', name: 'Camion 5T', createdAt: new Date().toISOString() },
        { id: '6', name: 'Camion 7.5T', createdAt: new Date().toISOString() },
        { id: '7', name: 'Camion 10T', createdAt: new Date().toISOString() },
        { id: '8', name: 'Camion 15T', createdAt: new Date().toISOString() },
        { id: '9', name: 'Camion 20T', createdAt: new Date().toISOString() }
      ];
      setVehicleTypes(defaultVehicleTypes);
      localStorage.setItem('logigrine_vehicle_types', JSON.stringify(defaultVehicleTypes));
    }

    const savedCompanies = localStorage.getItem('logigrine_companies');
    if (savedCompanies) {
      setCompanies(JSON.parse(savedCompanies));
    }
  }, []);

  useEffect(() => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(u => 
        u.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.phone.includes(searchTerm)
      );
    }

    if (filterRole !== 'all') {
      filtered = filtered.filter(u => u.role === filterRole);
    }

    setFilteredUsers(filtered);
  }, [users, searchTerm, filterRole]);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const [firstName, ...lastNameParts] = userForm.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userForm.username,
      role: userForm.role as any,
      fullName: userForm.fullName,
      firstName,
      lastName,
      phone: userForm.phone,
      createdAt: new Date().toISOString(),
      isActive: true,
      password: userForm.password,
      ...(userForm.role === 'chauffeur' && {
        vehicleType: userForm.vehicleType,
        employeeType: userForm.employeeType as any
      })
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    
    setUserForm({
      username: '',
      fullName: '',
      phone: '',
      role: 'chauffeur',
      password: '',
      vehicleType: '',
      employeeType: 'interne'
    });
    
    setShowNewUser(false);
    toast.success('Utilisateur créé avec succès');
  };

  const handleCreateVehicleType = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVehicleType: VehicleType = {
      id: Date.now().toString(),
      name: vehicleTypeForm.name,
      createdAt: new Date().toISOString()
    };

    const updatedVehicleTypes = [...vehicleTypes, newVehicleType];
    setVehicleTypes(updatedVehicleTypes);
    localStorage.setItem('logigrine_vehicle_types', JSON.stringify(updatedVehicleTypes));
    
    setVehicleTypeForm({ name: '' });
    setShowNewVehicleType(false);
    toast.success('Type de véhicule créé avec succès');
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCompany: Company = {
      id: Date.now().toString(),
      name: companyForm.name,
      createdAt: new Date().toISOString()
    };

    const updatedCompanies = [...companies, newCompany];
    setCompanies(updatedCompanies);
    localStorage.setItem('logigrine_companies', JSON.stringify(updatedCompanies));
    
    setCompanyForm({ name: '' });
    setShowNewCompany(false);
    toast.success('Société créée avec succès');
  };

  const handleDeleteVehicleType = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce type de véhicule ?')) return;
    
    const updatedVehicleTypes = vehicleTypes.filter(vt => vt.id !== id);
    setVehicleTypes(updatedVehicleTypes);
    localStorage.setItem('logigrine_vehicle_types', JSON.stringify(updatedVehicleTypes));
    toast.success('Type de véhicule supprimé');
  };

  const handleDeleteCompany = (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette société ?')) return;
    
    const updatedCompanies = companies.filter(c => c.id !== id);
    setCompanies(updatedCompanies);
    localStorage.setItem('logigrine_companies', JSON.stringify(updatedCompanies));
    toast.success('Société supprimée');
  };

  const getDisplayName = (user: User) => {
    if (user.role === 'chauffeur' && user.employeeType === 'externe') {
      return `${user.fullName}`;
    }
    return user.fullName;
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'planificateur':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'financier':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'chauffeur':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const roleOptions = [
    { value: 'chauffeur', label: 'Chauffeur' },
    { value: 'planificateur', label: 'Planificateur' },
    { value: 'financier', label: 'Financier' },
    { value: 'admin', label: 'Admin/Développeur' }
  ];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    chauffeurUsers: users.filter(u => u.role === 'chauffeur').length,
    planificateurUsers: users.filter(u => u.role === 'planificateur').length,
    financierUsers: users.filter(u => u.role === 'financier').length
  };

  const filterOptions = roleOptions.map(role => ({ value: role.value, label: role.label }));

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Administration - Développeur
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Gestion complète du système Logigrine
          </p>
        </div>
        <div className="flex gap-2">
          <PasswordChangeDialog />
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Utilisateurs
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} actifs, {stats.inactiveUsers} inactifs
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Chauffeurs
            </CardTitle>
            <Activity className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.chauffeurUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Planificateurs
            </CardTitle>
            <Settings className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.planificateurUsers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Administrateurs
            </CardTitle>
            <Shield className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.adminUsers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Onglets */}
      <Tabs defaultValue="users" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="vehicles">Types de véhicules</TabsTrigger>
          <TabsTrigger value="companies">Sociétés</TabsTrigger>
          <TabsTrigger value="system">Configuration</TabsTrigger>
        </TabsList>

        {/* Gestion des utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Utilisateurs du système
                <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvel utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Créer un utilisateur</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur</Label>
                        <Input
                          id="username"
                          value={userForm.username}
                          onChange={(e) => setUserForm({...userForm, username: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="fullName">Nom & Prénom</Label>
                        <Input
                          id="fullName"
                          value={userForm.fullName}
                          onChange={(e) => setUserForm({...userForm, fullName: e.target.value})}
                          required
                          placeholder="Jean Martin"
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={userForm.phone}
                          onChange={(e) => setUserForm({...userForm, phone: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={userForm.role} onValueChange={(value) => setUserForm({...userForm, role: value})}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {roleOptions.map(role => (
                              <SelectItem key={role.value} value={role.value}>
                                {role.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      {userForm.role === 'chauffeur' && (
                        <>
                          <div>
                            <Label htmlFor="vehicleType">Type de véhicule</Label>
                            <Select value={userForm.vehicleType} onValueChange={(value) => setUserForm({...userForm, vehicleType: value})}>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un véhicule" />
                              </SelectTrigger>
                              <SelectContent>
                                {vehicleTypes.map(type => (
                                  <SelectItem key={type.id} value={type.name}>
                                    {type.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <div>
                            <Label htmlFor="employeeType">Type d'employé</Label>
                            <Select value={userForm.employeeType} onValueChange={(value) => setUserForm({...userForm, employeeType: value})}>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="interne">Interne</SelectItem>
                                <SelectItem value="externe">Externe</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </>
                      )}
                      <div>
                        <Label htmlFor="password">Mot de passe</Label>
                        <Input
                          id="password"
                          type="password"
                          value={userForm.password}
                          onChange={(e) => setUserForm({...userForm, password: e.target.value})}
                          required
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewUser(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          Créer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SearchAndFilter
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterValue={filterRole}
                onFilterChange={setFilterRole}
                filterOptions={filterOptions}
                searchPlaceholder="Rechercher par nom, username ou téléphone..."
                filterPlaceholder="Filtrer par rôle"
              />
              
              <div className="space-y-4">
                {filteredUsers.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {u.fullName.split(' ').map(n => n.charAt(0)).join('')}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{getDisplayName(u)}</div>
                        <div className="text-sm text-gray-500">@{u.username}</div>
                        <div className="text-sm text-gray-500">{u.phone}</div>
                        {u.role === 'chauffeur' && u.vehicleType && (
                          <div className="text-xs text-gray-400">
                            {u.vehicleType} - {u.employeeType}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleBadgeColor(u.role)}>
                        {u.role}
                      </Badge>
                      <Badge className={u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}>
                        {u.isActive ? 'Actif' : 'Inactif'}
                      </Badge>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {}}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {}}
                        >
                          {u.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        {u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {}}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des types de véhicules */}
        <TabsContent value="vehicles" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Types de véhicules
                <Dialog open={showNewVehicleType} onOpenChange={setShowNewVehicleType}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nouveau type
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer un type de véhicule</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateVehicleType} className="space-y-4">
                      <div>
                        <Label htmlFor="vehicleName">Nom du type de véhicule</Label>
                        <Input
                          id="vehicleName"
                          value={vehicleTypeForm.name}
                          onChange={(e) => setVehicleTypeForm({name: e.target.value})}
                          required
                          placeholder="Ex: Camion 12T"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewVehicleType(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          Créer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicleTypes.map((vehicleType) => (
                  <div key={vehicleType.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Truck className="h-8 w-8 text-blue-600" />
                      <div>
                        <div className="font-medium">{vehicleType.name}</div>
                        <div className="text-sm text-gray-500">
                          Créé le {new Date(vehicleType.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingVehicleType(vehicleType);
                          setVehicleTypeForm({name: vehicleType.name});
                          setShowNewVehicleType(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteVehicleType(vehicleType.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gestion des sociétés */}
        <TabsContent value="companies" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                Sociétés
                <Dialog open={showNewCompany} onOpenChange={setShowNewCompany}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Nouvelle société
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Créer une société</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateCompany} className="space-y-4">
                      <div>
                        <Label htmlFor="companyName">Nom de la société</Label>
                        <Input
                          id="companyName"
                          value={companyForm.name}
                          onChange={(e) => setCompanyForm({name: e.target.value})}
                          required
                          placeholder="Ex: Société Transport SARL"
                        />
                      </div>
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setShowNewCompany(false)}>
                          Annuler
                        </Button>
                        <Button type="submit">
                          Créer
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {companies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <Building className="h-8 w-8 text-green-600" />
                      <div>
                        <div className="font-medium">{company.name}</div>
                        <div className="text-sm text-gray-500">
                          Créée le {new Date(company.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingCompany(company);
                          setCompanyForm({name: company.name});
                          setShowNewCompany(true);
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteCompany(company.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configuration système */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration système</CardTitle>
              <CardDescription>
                Paramètres avancés du système Logigrine
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Types de véhicules</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Mini véhicule</div>
                        <div>• Fourgon</div>
                        <div>• Camion 2.5T à 20T</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Unités CPH</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• CPH Nord</div>
                        <div>• CPH Sud</div>
                        <div>• CPH Est</div>
                        <div>• CPH Ouest</div>
                        <div>• CPH Centre</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Types d'employés</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Interne</div>
                        <div>• Externe (préfixe "TP")</div>
                      </div>
                    </CardContent>
                  </Card>
                  
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-lg">Workflow</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>• Déclaration chauffeur</div>
                        <div>• Validation planificateur</div>
                        <div>• Traitement financier</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
