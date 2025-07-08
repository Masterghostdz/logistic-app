
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
import { Plus, Users, Settings, Shield, Activity, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [users, setUsers] = useState<User[]>([]);
  const [showNewUser, setShowNewUser] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userForm, setUserForm] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    role: 'chauffeur',
    password: ''
  });

  useEffect(() => {
    // Charger les utilisateurs depuis localStorage
    const savedUsers = localStorage.getItem('logigrine_users');
    if (savedUsers) {
      setUsers(JSON.parse(savedUsers));
    } else {
      // Initialiser avec les comptes de démonstration
      const demoUsers: User[] = [
        {
          id: '1',
          username: 'chauffeur',
          role: 'chauffeur',
          firstName: 'Jean',
          lastName: 'Martin',
          email: 'jean.martin@logigrine.com',
          phone: '+33 6 12 34 56 78',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '2',
          username: 'planificateur',
          role: 'planificateur',
          firstName: 'Marie',
          lastName: 'Dubois',
          email: 'marie.dubois@logigrine.com',
          phone: '+33 6 23 45 67 89',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '3',
          username: 'financier',
          role: 'financier',
          firstName: 'Pierre',
          lastName: 'Moreau',
          email: 'pierre.moreau@logigrine.com',
          phone: '+33 6 34 56 78 90',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '4',
          username: 'financier_unite',
          role: 'financier_unite',
          firstName: 'Sophie',
          lastName: 'Bernard',
          email: 'sophie.bernard@logigrine.com',
          phone: '+33 6 45 67 89 01',
          createdAt: new Date().toISOString(),
          isActive: true
        },
        {
          id: '5',
          username: 'admin',
          role: 'admin',
          firstName: 'Admin',
          lastName: 'System',
          email: 'admin@logigrine.com',
          phone: '+33 6 56 78 90 12',
          createdAt: new Date().toISOString(),
          isActive: true
        }
      ];
      setUsers(demoUsers);
      localStorage.setItem('logigrine_users', JSON.stringify(demoUsers));
    }
  }, []);

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newUser: User = {
      id: Date.now().toString(),
      username: userForm.username,
      role: userForm.role as any,
      firstName: userForm.firstName,
      lastName: userForm.lastName,
      email: userForm.email,
      phone: userForm.phone,
      createdAt: new Date().toISOString(),
      isActive: true
    };

    const updatedUsers = [...users, newUser];
    setUsers(updatedUsers);
    localStorage.setItem('logigrine_users', JSON.stringify(updatedUsers));
    
    // Réinitialiser le formulaire
    setUserForm({
      username: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      role: 'chauffeur',
      password: ''
    });
    
    setShowNewUser(false);
    toast.success(t('forms.success'));
  };

  const handleDeleteUser = (id: string) => {
    if (id === user?.id) {
      toast.error('Vous ne pouvez pas supprimer votre propre compte');
      return;
    }
    
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Prénom</Label>
                  <Input
                    id="firstName"
                    value={userForm.firstName}
                    onChange={(e) => setUserForm({...userForm, firstName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nom</Label>
                  <Input
                    id="lastName"
                    value={userForm.lastName}
                    onChange={(e) => setUserForm({...userForm, lastName: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={userForm.email}
                  onChange={(e) => setUserForm({...userForm, email: e.target.value})}
                  required
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
                  {t('forms.cancel')}
                </Button>
                <Button type="submit">
                  {t('forms.save')}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
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
              <div className="space-y-4">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <span className="text-blue-600 font-medium">
                          {u.firstName.charAt(0)}{u.lastName.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium">{u.firstName} {u.lastName}</div>
                        <div className="text-sm text-gray-500">{u.email}</div>
                        <div className="text-sm text-gray-500">@{u.username}</div>
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
                          onClick={() => handleToggleUserStatus(u.id)}
                        >
                          {u.isActive ? 'Désactiver' : 'Activer'}
                        </Button>
                        {u.id !== user?.id && (
                          <Button
                            size="sm"
                            variant="outline"
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
