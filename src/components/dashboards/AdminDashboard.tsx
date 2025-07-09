
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  User,
  ClipboardList
} from 'lucide-react';
import { User as UserType, Company, VehicleType } from '../../types';
import Header from '../Header';
import ProfilePage from '../ProfilePage';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [users, setUsers] = useState<UserType[]>([
    {
      id: '1',
      username: 'admin',
      password: 'admin123',
      role: 'admin',
      firstName: 'Admin',
      lastName: 'System',
      fullName: 'Admin System',
      phone: '+213 21 00 00 00',
      createdAt: new Date().toISOString()
    }
  ]);

  const [companies, setCompanies] = useState<Company[]>([
    {
      id: '1',
      name: 'Logigrine Algérie',
      address: '123 Rue des Entrepreneurs, Alger',
      phone: '+213 21 12 34 56',
      email: 'contact@logigrine.dz',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Transport Express DZ',
      address: '456 Boulevard des Martyrs, Oran',
      phone: '+213 41 98 76 54',
      email: 'info@transportexpress.dz',
      createdAt: new Date().toISOString()
    }
  ]);

  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([
    {
      id: '1',
      name: 'Camion 3.5T',
      description: 'Camion léger jusqu\'à 3.5 tonnes',
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Camionnette',
      description: 'Véhicule utilitaire léger',
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      name: 'Utilitaire',
      description: 'Véhicule utilitaire standard',
      createdAt: new Date().toISOString()
    },
    {
      id: '4',
      name: 'Poids Lourd',
      description: 'Camion poids lourd + 7.5 tonnes',
      createdAt: new Date().toISOString()
    }
  ]);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateVehicleType, setShowCreateVehicleType] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);

  const [newUser, setNewUser] = useState({
    username: '',
    password: '',
    role: 'chauffeur' as UserType['role'],
    firstName: '',
    lastName: '',
    phone: ''
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone: '',
    email: ''
  });

  const [newVehicleType, setNewVehicleType] = useState({
    name: '',
    description: ''
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.password || !newUser.firstName || !newUser.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingUser) {
      const updatedUser: UserType = {
        ...editingUser,
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        phone: newUser.phone
      };

      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      toast.success('Utilisateur modifié');
    } else {
      const user: UserType = {
        id: Date.now().toString(),
        username: newUser.username,
        password: newUser.password,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        phone: newUser.phone,
        createdAt: new Date().toISOString()
      };

      setUsers(prev => [...prev, user]);
      toast.success('Utilisateur créé');
    }

    setNewUser({
      username: '',
      password: '',
      role: 'chauffeur',
      firstName: '',
      lastName: '',
      phone: ''
    });
    setShowCreateUser(false);
  };

  const handleCreateCompany = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompany.name) {
      toast.error('Le nom de la société est obligatoire');
      return;
    }

    if (editingCompany) {
      const updatedCompany: Company = {
        ...editingCompany,
        name: newCompany.name,
        address: newCompany.address,
        phone: newCompany.phone,
        email: newCompany.email
      };

      setCompanies(prev => prev.map(c => c.id === editingCompany.id ? updatedCompany : c));
      setEditingCompany(null);
      toast.success('Société modifiée');
    } else {
      const company: Company = {
        id: Date.now().toString(),
        name: newCompany.name,
        address: newCompany.address,
        phone: newCompany.phone,
        email: newCompany.email,
        createdAt: new Date().toISOString()
      };

      setCompanies(prev => [...prev, company]);
      toast.success('Société créée');
    }

    setNewCompany({
      name: '',
      address: '',
      phone: '',
      email: ''
    });
    setShowCreateCompany(false);
  };

  const handleCreateVehicleType = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newVehicleType.name) {
      toast.error('Le nom du type de véhicule est obligatoire');
      return;
    }

    if (editingVehicleType) {
      const updatedVehicleType: VehicleType = {
        ...editingVehicleType,
        name: newVehicleType.name,
        description: newVehicleType.description
      };

      setVehicleTypes(prev => prev.map(v => v.id === editingVehicleType.id ? updatedVehicleType : v));
      setEditingVehicleType(null);
      toast.success('Type de véhicule modifié');
    } else {
      const vehicleType: VehicleType = {
        id: Date.now().toString(),
        name: newVehicleType.name,
        description: newVehicleType.description,
        createdAt: new Date().toISOString()
      };

      setVehicleTypes(prev => [...prev, vehicleType]);
      toast.success('Type de véhicule créé');
    }

    setNewVehicleType({
      name: '',
      description: ''
    });
    setShowCreateVehicleType(false);
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      password: user.password,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || ''
    });
    setShowCreateUser(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      address: company.address || '',
      phone: company.phone || '',
      email: company.email || ''
    });
    setShowCreateCompany(true);
  };

  const handleEditVehicleType = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setNewVehicleType({
      name: vehicleType.name,
      description: vehicleType.description || ''
    });
    setShowCreateVehicleType(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Utilisateur supprimé');
  };

  const handleDeleteCompany = (id: string) => {
    setCompanies(prev => prev.filter(c => c.id !== id));
    toast.success('Société supprimée');
  };

  const handleDeleteVehicleType = (id: string) => {
    setVehicleTypes(prev => prev.filter(v => v.id !== id));
    toast.success('Type de véhicule supprimé');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      planificateur: 'bg-blue-100 text-blue-800',
      financier: 'bg-green-100 text-green-800',
      financier_unite: 'bg-purple-100 text-purple-800',
      chauffeur: 'bg-gray-100 text-gray-800'
    };
    
    const roleLabels = {
      admin: 'Administrateur',
      planificateur: 'Planificateur',
      financier: 'Financier',
      financier_unite: 'Financier Unité',
      chauffeur: 'Chauffeur'
    };

    return (
      <Badge className={roleColors[role as keyof typeof roleColors]}>
        {roleLabels[role as keyof typeof roleLabels]}
      </Badge>
    );
  };

  if (activeTab === 'profile') {
    return (
      <div>
        <Header onProfileClick={handleProfileClick} />
        <div className="p-6">
          <ProfilePage onBack={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  return (
    <div>
      <Header onProfileClick={handleProfileClick} />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
          <nav className="space-y-2">
            <Button
              variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('dashboard')}
            >
              <ClipboardList className="mr-2 h-4 w-4" />
              Tableau de bord
            </Button>
            <Button
              variant={activeTab === 'users' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('users')}
            >
              <Users className="mr-2 h-4 w-4" />
              Utilisateurs
            </Button>
            <Button
              variant={activeTab === 'configuration' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('configuration')}
            >
              <Settings className="mr-2 h-4 w-4" />
              Configuration
            </Button>
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">Tableau de bord - Administrateur</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sociétés</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{companies.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Types de Véhicules</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{vehicleTypes.length}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
                <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter un utilisateur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur *</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newUser.password}
                          onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <select
                          id="role"
                          value={newUser.role}
                          onChange={(e) => setNewUser({ ...newUser, role: e.target.value as UserType['role'] })}
                          className="w-full px-3 py-2 border border-input rounded-md"
                        >
                          <option value="chauffeur">Chauffeur</option>
                          <option value="planificateur">Planificateur</option>
                          <option value="financier">Financier</option>
                          <option value="financier_unite">Financier Unité</option>
                          <option value="admin">Administrateur</option>
                        </select>
                      </div>
                      <div>
                        <Label htmlFor="phone">Téléphone</Label>
                        <Input
                          id="phone"
                          value={newUser.phone}
                          onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingUser ? 'Modifier' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCreateUser(false);
                          setEditingUser(null);
                          setNewUser({
                            username: '',
                            password: '',
                            role: 'chauffeur',
                            firstName: '',
                            lastName: '',
                            phone: ''
                          });
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>{user.phone || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditUser(user)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteUser(user.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Configuration</h2>

              {/* Sociétés */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sociétés</CardTitle>
                      <CardDescription>Gestion des sociétés partenaires</CardDescription>
                    </div>
                    <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingCompany ? 'Modifier la société' : 'Créer une nouvelle société'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCompany} className="space-y-4">
                          <div>
                            <Label htmlFor="companyName">Nom de la société *</Label>
                            <Input
                              id="companyName"
                              value={newCompany.name}
                              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyAddress">Adresse</Label>
                            <Input
                              id="companyAddress"
                              value={newCompany.address}
                              onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyPhone">Téléphone</Label>
                            <Input
                              id="companyPhone"
                              value={newCompany.phone}
                              onChange={(e) => setNewCompany({ ...newCompany, phone: e.target.value })}
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyEmail">Email</Label>
                            <Input
                              id="companyEmail"
                              type="email"
                              value={newCompany.email}
                              onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingCompany ? 'Modifier' : 'Créer'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowCreateCompany(false);
                              setEditingCompany(null);
                              setNewCompany({ name: '', address: '', phone: '', email: '' });
                            }}>
                              Annuler
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Adresse</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {companies.map((company) => (
                        <TableRow key={company.id}>
                          <TableCell className="font-medium">{company.name}</TableCell>
                          <TableCell>{company.address || '-'}</TableCell>
                          <TableCell>{company.phone || '-'}</TableCell>
                          <TableCell>{company.email || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditCompany(company)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteCompany(company.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              {/* Types de véhicules */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Types de Véhicules</CardTitle>
                      <CardDescription>Gestion des types de véhicules disponibles</CardDescription>
                    </div>
                    <Dialog open={showCreateVehicleType} onOpenChange={setShowCreateVehicleType}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          Ajouter
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingVehicleType ? 'Modifier le type de véhicule' : 'Créer un nouveau type de véhicule'}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateVehicleType} className="space-y-4">
                          <div>
                            <Label htmlFor="vehicleTypeName">Nom du type *</Label>
                            <Input
                              id="vehicleTypeName"
                              value={newVehicleType.name}
                              onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="vehicleTypeDescription">Description</Label>
                            <Input
                              id="vehicleTypeDescription"
                              value={newVehicleType.description}
                              onChange={(e) => setNewVehicleType({ ...newVehicleType, description: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingVehicleType ? 'Modifier' : 'Créer'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowCreateVehicleType(false);
                              setEditingVehicleType(null);
                              setNewVehicleType({ name: '', description: '' });
                            }}>
                              Annuler
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleTypes.map((vehicleType) => (
                        <TableRow key={vehicleType.id}>
                          <TableCell className="font-medium">{vehicleType.name}</TableCell>
                          <TableCell>{vehicleType.description || '-'}</TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleEditVehicleType(vehicleType)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleDeleteVehicleType(vehicleType.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
