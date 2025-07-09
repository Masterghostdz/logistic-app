
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  ClipboardList,
  Key
} from 'lucide-react';
import { User as UserType, Company, VehicleType } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import { demoAccountsConfig } from '../../config/demoAccounts';
import Header from '../Header';
import ProfilePage from '../ProfilePage';
import PhoneNumbersField from '../PhoneNumbersField';
import PasswordField from '../PasswordField';
import { simpleHash } from '../../utils/authUtils';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { 
    companies, 
    vehicleTypes, 
    addCompany, 
    addVehicleType, 
    updateCompany, 
    updateVehicleType, 
    deleteCompany, 
    deleteVehicleType 
  } = useSharedData();
  
  // Initialize users from demo accounts configuration with default passwords
  const [users, setUsers] = useState<(UserType & { password: string })[]>(() => {
    return demoAccountsConfig.map(account => ({
      id: account.id,
      username: account.username,
      role: account.role,
      firstName: account.firstName,
      lastName: account.lastName,
      fullName: account.fullName,
      phone: account.phone,
      email: account.email,
      createdAt: account.createdAt,
      isActive: account.isActive,
      password: account.username === 'admin' ? 'admin123' : 'demo123' // Default passwords based on role
    }));
  });

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateVehicleType, setShowCreateVehicleType] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    username: '',
    role: 'chauffeur' as UserType['role'],
    firstName: '',
    lastName: '',
    phone: [] as string[]
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone: [] as string[],
    email: ''
  });

  const [newVehicleType, setNewVehicleType] = useState({
    name: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newUser.username || !newUser.firstName || !newUser.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingUser) {
      const updatedUser = {
        ...editingUser,
        username: newUser.username,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        phone: newUser.phone,
        password: users.find(u => u.id === editingUser.id)?.password || 'password123'
      };

      setUsers(prev => prev.map(u => u.id === editingUser.id ? updatedUser : u));
      setEditingUser(null);
      toast.success('Utilisateur modifié');
    } else {
      const user = {
        id: Date.now().toString(),
        username: newUser.username,
        role: newUser.role,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        fullName: `${newUser.firstName} ${newUser.lastName}`,
        phone: newUser.phone,
        createdAt: new Date().toISOString(),
        password: 'password123' // Default password
      };

      setUsers(prev => [...prev, user]);
      toast.success('Utilisateur créé avec mot de passe par défaut: password123');
    }

    setNewUser({
      username: '',
      role: 'chauffeur',
      firstName: '',
      lastName: '',
      phone: []
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

      updateCompany(editingCompany.id, updatedCompany);
      setEditingCompany(null);
      toast.success('Société modifiée et synchronisée');
    } else {
      const company: Company = {
        id: Date.now().toString(),
        name: newCompany.name,
        address: newCompany.address,
        phone: newCompany.phone,
        email: newCompany.email,
        createdAt: new Date().toISOString()
      };

      addCompany(company);
      toast.success('Société créée et synchronisée');
    }

    setNewCompany({
      name: '',
      address: '',
      phone: [],
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
        name: newVehicleType.name
      };

      updateVehicleType(editingVehicleType.id, updatedVehicleType);
      setEditingVehicleType(null);
      toast.success('Type de véhicule modifié et synchronisé');
    } else {
      const vehicleType: VehicleType = {
        id: Date.now().toString(),
        name: newVehicleType.name,
        createdAt: new Date().toISOString()
      };

      addVehicleType(vehicleType);
      toast.success('Type de véhicule créé et synchronisé');
    }

    setNewVehicleType({
      name: ''
    });
    setShowCreateVehicleType(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (selectedUserForPassword) {
      const updatedUsers = users.map(user => 
        user.id === selectedUserForPassword 
          ? { ...user, password: passwordData.newPassword }
          : user
      );
      
      setUsers(updatedUsers);
      toast.success('Mot de passe modifié avec succès');
      
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSelectedUserForPassword(null);
      setShowChangePassword(false);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || []
    });
    setShowCreateUser(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      address: company.address || '',
      phone: company.phone || [],
      email: company.email || ''
    });
    setShowCreateCompany(true);
  };

  const handleEditVehicleType = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setNewVehicleType({
      name: vehicleType.name
    });
    setShowCreateVehicleType(true);
  };

  const handleDeleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Utilisateur supprimé');
  };

  const handleDeleteCompany = (id: string) => {
    deleteCompany(id);
    toast.success('Société supprimée et synchronisée');
  };

  const handleDeleteVehicleType = (id: string) => {
    deleteVehicleType(id);
    toast.success('Type de véhicule supprimé et synchronisé');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const openChangePasswordDialog = (userId: string) => {
    setSelectedUserForPassword(userId);
    setShowChangePassword(true);
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
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserType['role'] })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chauffeur">Chauffeur</SelectItem>
                            <SelectItem value="planificateur">Planificateur</SelectItem>
                            <SelectItem value="financier">Financier</SelectItem>
                            <SelectItem value="financier_unite">Financier Unité</SelectItem>
                            <SelectItem value="admin">Administrateur</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <PhoneNumbersField
                        label="Numéros de téléphone"
                        phones={newUser.phone}
                        onChange={(phones) => setNewUser({ ...newUser, phone: phones })}
                      />
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingUser ? 'Modifier' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCreateUser(false);
                          setEditingUser(null);
                          setNewUser({
                            username: '',
                            role: 'chauffeur',
                            firstName: '',
                            lastName: '',
                            phone: []
                          });
                        }}>
                          Annuler
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Dialog for changing password */}
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>Changer le mot de passe</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Changer le mot de passe
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowChangePassword(false);
                        setSelectedUserForPassword(null);
                        setPasswordData({ newPassword: '', confirmPassword: '' });
                      }}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nom complet</TableHead>
                        <TableHead>Nom d'utilisateur</TableHead>
                        <TableHead>Rôle</TableHead>
                        <TableHead>Téléphone</TableHead>
                        <TableHead>Mot de passe</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.fullName}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{getRoleBadge(user.role)}</TableCell>
                          <TableCell>
                            {user.phone && user.phone.length > 0 ? (
                              <div className="space-y-1">
                                {user.phone.map((phone, index) => (
                                  <div key={index} className="text-sm">{phone}</div>
                                ))}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <PasswordField password={user.password} showLabel={false} />
                          </TableCell>
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
                                onClick={() => openChangePasswordDialog(user.id)}
                              >
                                <Key className="h-4 w-4" />
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
                          <PhoneNumbersField
                            label="Numéros de téléphone"
                            phones={newCompany.phone}
                            onChange={(phones) => setNewCompany({ ...newCompany, phone: phones })}
                          />
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
                              setNewCompany({ name: '', address: '', phone: [], email: '' });
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
                          <TableCell>
                            {company.phone && company.phone.length > 0 ? (
                              <div className="space-y-1">
                                {company.phone.map((phone, index) => (
                                  <div key={index} className="text-sm">{phone}</div>
                                ))}
                              </div>
                            ) : '-'}
                          </TableCell>
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
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingVehicleType ? 'Modifier' : 'Créer'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowCreateVehicleType(false);
                              setEditingVehicleType(null);
                              setNewVehicleType({ name: '' });
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
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehicleTypes.map((vehicleType) => (
                        <TableRow key={vehicleType.id}>
                          <TableCell className="font-medium">{vehicleType.name}</TableCell>
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
