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
import { User } from '../../types';
import { Plus, Users, Settings, Shield, Activity, Edit, Trash2, Search, Filter } from 'lucide-react';
import { toast } from 'sonner';
import PasswordChangeDialog from '../PasswordChangeDialog';
import SearchAndFilter from '../SearchAndFilter';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
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

  const vehicleTypes = [
    'mini_vehicule', 'fourgon', 'camion_2_5t', 'camion_3_5t', 
    'camion_5t', 'camion_7_5t', 'camion_10t', 'camion_15t', 'camion_20t'
  ];

  useEffect(() => {
    const savedUsers = localStorage.getItem('logigrine_users');
    if (savedUsers) {
      const loadedUsers = JSON.parse(savedUsers);
      setUsers(loadedUsers);
      setFilteredUsers(loadedUsers);
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
        vehicleType: userForm.vehicleType as any,
        employeeType: userForm.employeeType as any
      })
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    
    // Réinitialiser le formulaire
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
    toast.success(t('forms.success'));
  };

  const handleEditUser = (userToEdit: User) => {
    setEditingUser(userToEdit);
    setUserForm({
      username: userToEdit.username,
      fullName: userToEdit.fullName,
      phone: userToEdit.phone,
      role: userToEdit.role,
      password: userToEdit.password || '',
      vehicleType: userToEdit.vehicleType || '',
      employeeType: userToEdit.employeeType || 'interne'
    });
    setShowNewUser(true);
  };

  const handleUpdateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingUser) return;
    
    const [firstName, ...lastNameParts] = userForm.fullName.split(' ');
    const lastName = lastNameParts.join(' ') || '';
    
    const updatedUser: User = {
      ...editingUser,
      username: userForm.username,
      fullName: userForm.fullName,
      firstName,
      lastName,
      phone: userForm.phone,
      role: userForm.role as any,
      password: userForm.password,
      ...(userForm.role === 'chauffeur' && {
        vehicleType: userForm.vehicleType as any,
        employeeType: userForm.employeeType as any
      })
    };

    const updatedUsers = users.map(u => 
      u.id === editingUser.id ? updatedUser : u
    );
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
    
    setEditingUser(null);
    setShowNewUser(false);
    toast.success('Utilisateur modifié avec succès');
  };

  const handleDeleteUser = (id: string) => {
    if (id === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) return;
    
    const updatedUsers = users.filter(u => u.id !== id);
    setUsers(updatedUsers);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    toast.success('Utilisateur supprimé');
  };

  const handleToggleUserStatus = (id: string) => {
    const updatedUsers = users.map(u => 
      u.id === id ? { ...u, isActive: !u.isActive } : u
    );
    setUsers(updatedUsers);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    toast.success('Statut utilisateur modifié');
  };

  const getDisplayName = (user: User) => {
    if (user.role === 'chauffeur' && user.employeeType === 'externe') {
      return `TP - ${user.fullName}`;
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
      case 'financier_unite':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
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
    { value: 'financier_unite', label: 'Financier Unité' },
    { value: 'admin', label: 'Admin/Développeur' }
  ];

  const stats = {
    totalUsers: users.length,
    activeUsers: users.filter(u => u.isActive).length,
    inactiveUsers: users.filter(u => !u.isActive).length,
    adminUsers: users.filter(u => u.role === 'admin').length,
    chauffeurUsers: users.filter(u => u.role === 'chauffeur').length,
    planificateurUsers: users.filter(u => u.role === 'planificateur').length,
    financierUsers: users.filter(u => u.role === 'financier' || u.role === 'financier_unite').length
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
          <Dialog open={showNewUser} onOpenChange={setShowNewUser}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingUser ? 'Modifier utilisateur' : 'Nouvel utilisateur'}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>{editingUser ? 'Modifier utilisateur' : 'Créer un utilisateur'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={editingUser ? handleUpdateUser : handleCreateUser} className="space-y-4">
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
                            <SelectItem key={type} value={type}>
                              {t(`vehicles.${type}`)}
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
                  <Button type="button" variant="outline" onClick={() => {
                    setShowNewUser(false);
                    setEditingUser(null);
                    setUserForm({
                      username: '',
                      fullName: '',
                      phone: '',
                      role: 'chauffeur',
                      password: '',
                      vehicleType: '',
                      employeeType: 'interne'
                    });
                  }}>
                    {t('forms.cancel')}
                  </Button>
                  <Button type="submit">
                    {editingUser ? 'Modifier' : t('forms.save')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
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
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="users">Gestion des utilisateurs</TabsTrigger>
          <TabsTrigger value="system">Configuration système</TabsTrigger>
        </TabsList>

        {/* Gestion des utilisateurs */}
        <TabsContent value="users" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Utilisateurs du système</CardTitle>
              <CardDescription>
                Gérez tous les utilisateurs et leurs permissions
              </CardDescription>
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
                            {t(`vehicles.${u.vehicleType}`)} - {u.employeeType}
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
                          onClick={() => handleEditUser(u)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleToggleUserStatus(u.id)}
                        >
                          {u.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        {u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteUser(u.id)}
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
