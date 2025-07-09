import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Check, 
  X, 
  Plus, 
  User, 
  MapPin,
  Settings,
  ClipboardList,
  Edit,
  Trash2
} from 'lucide-react';
import { Declaration, Chauffeur } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import SearchAndFilter from '../SearchAndFilter';
import ProfilePage from '../ProfilePage';
import TracageSection from '../TracageSection';
import Header from '../Header';
import PasswordField from '../PasswordField';
import PhoneNumbersField from '../PhoneNumbersField';
import EditDeclarationDialog from '../EditDeclarationDialog';

const PlanificateurDashboard = () => {
  const { vehicleTypes } = useSharedData();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const [declarations, setDeclarations] = useState<Declaration[]>([
    {
      id: '1',
      number: 'DCP/24/01/0001',
      programNumber: '0001',
      year: '24',
      month: '01',
      chauffeurId: '1',
      chauffeurName: 'Ahmed Benali',
      distance: 1250,
      deliveryFees: 75000,
      notes: 'Livraison dans les délais',
      photos: [],
      status: 'en_cours',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      number: 'DCP/24/02/0002',
      programNumber: '0002',
      year: '24',
      month: '02',
      chauffeurId: '2',
      chauffeurName: 'TP - Fatima Said',
      distance: 800,
      deliveryFees: 48000,
      notes: 'Retard dû à la circulation',
      photos: [],
      status: 'valide',
      createdAt: '2024-02-20T09:15:00Z',
      validatedAt: '2024-02-22T14:00:00Z',
      validatedBy: 'Planificateur'
    },
    {
      id: '3',
      number: 'DCP/24/01/0003',
      programNumber: '0003',
      year: '24',
      month: '01',
      chauffeurId: '3',
      chauffeurName: 'Ali Hassan',
      distance: 2000,
      deliveryFees: 120000,
      notes: 'Livraison urgente',
      photos: [],
      status: 'valide',
      createdAt: '2024-01-28T16:45:00Z',
      validatedAt: '2024-01-30T11:30:00Z',
      validatedBy: 'Planificateur'
    },
    {
      id: '4',
      number: 'DCP/24/03/0004',
      programNumber: '0004',
      year: '24',
      month: '03',
      chauffeurId: '1',
      chauffeurName: 'Ahmed Benali',
      distance: 600,
      deliveryFees: 36000,
      notes: 'Problème technique avec le véhicule',
      photos: [],
      status: 'refuse',
      createdAt: '2024-03-05T14:00:00Z',
      validatedAt: '2024-03-07T10:00:00Z',
      validatedBy: 'Planificateur',
      refusalReason: 'Photos manquantes'
    }
  ]);

  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([
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
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      firstName: 'Fatima',
      lastName: 'Said',
      fullName: 'TP - Fatima Said',
      username: 'fsaid',
      password: 'demo123',
      phone: ['+213 66 98 76 54'],
      vehicleType: 'Camionnette',
      employeeType: 'externe',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '3',
      firstName: 'Ali',
      lastName: 'Hassan',
      fullName: 'Ali Hassan',
      username: 'ahassan',
      password: 'demo123',
      phone: ['+213 77 55 44 33'],
      vehicleType: 'Utilitaire',
      employeeType: 'interne',
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateChauffeur, setShowCreateChauffeur] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [editingChauffeur, setEditingChauffeur] = useState<Chauffeur | null>(null);
  const [newChauffeur, setNewChauffeur] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phone: [''],
    vehicleType: '',
    employeeType: 'interne' as 'interne' | 'externe'
  });

  const stats = useMemo(() => {
    const enAttente = declarations.filter(d => d.status === 'en_cours').length;
    
    return {
      enAttente
    };
  }, [declarations]);

  const filteredDeclarations = useMemo(() => {
    return declarations.filter(declaration => {
      if (searchValue) {
        const searchLower = searchValue.toLowerCase();
        if (!declaration.number.toLowerCase().includes(searchLower) &&
            !declaration.chauffeurName.toLowerCase().includes(searchLower)) {
          return false;
        }
      }
      
      if (filterStatus && filterStatus !== 'all' && declaration.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [declarations, searchValue, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs">En Attente</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 text-xs">Validé</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800 text-xs">Refusé</Badge>;
      default:
        return <Badge variant="outline" className="text-xs">{status}</Badge>;
    }
  };

  const handleCreateChauffeur = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChauffeur.firstName || !newChauffeur.lastName || !newChauffeur.username || !newChauffeur.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    if (editingChauffeur) {
      // Modification d'un chauffeur existant
      const updatedChauffeur: Chauffeur = {
        ...editingChauffeur,
        firstName: newChauffeur.firstName,
        lastName: newChauffeur.lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.firstName} ${newChauffeur.lastName}`,
        username: newChauffeur.username,
        password: newChauffeur.password,
        phone: newChauffeur.phone,
        vehicleType: newChauffeur.vehicleType,
        employeeType: newChauffeur.employeeType
      };

      setChauffeurs(prev => prev.map(c => c.id === editingChauffeur.id ? updatedChauffeur : c));
      setEditingChauffeur(null);
      toast.success('Chauffeur modifié avec succès');
    } else {
      // Création d'un nouveau chauffeur
      const chauffeur: Chauffeur = {
        id: Date.now().toString(),
        firstName: newChauffeur.firstName,
        lastName: newChauffeur.lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.firstName} ${newChauffeur.lastName}`,
        username: newChauffeur.username,
        password: newChauffeur.password,
        phone: newChauffeur.phone,
        vehicleType: newChauffeur.vehicleType,
        employeeType: newChauffeur.employeeType,
        isActive: true,
        createdAt: new Date().toISOString()
      };

      setChauffeurs(prev => [...prev, chauffeur]);
      toast.success('Chauffeur créé avec succès');
    }

    setNewChauffeur({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      phone: [''],
      vehicleType: '',
      employeeType: 'interne'
    });
    setShowCreateChauffeur(false);
  };

  const handleEditChauffeur = (chauffeur: Chauffeur) => {
    setEditingChauffeur(chauffeur);
    setNewChauffeur({
      firstName: chauffeur.firstName,
      lastName: chauffeur.lastName,
      username: chauffeur.username,
      password: chauffeur.password,
      phone: chauffeur.phone,
      vehicleType: chauffeur.vehicleType,
      employeeType: chauffeur.employeeType
    });
    setShowCreateChauffeur(true);
  };

  const handleValidateDeclaration = (id: string) => {
    setDeclarations(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: 'valide', validatedAt: new Date().toISOString(), validatedBy: 'Planificateur' }
        : d
    ));
    toast.success('Déclaration validée');
  };

  const handleRejectDeclaration = (id: string) => {
    setDeclarations(prev => prev.map(d => 
      d.id === id 
        ? { ...d, status: 'refuse', validatedAt: new Date().toISOString(), validatedBy: 'Planificateur' }
        : d
    ));
    toast.success('Déclaration refusée');
  };

  const handleEnAttenteClick = () => {
    setFilterStatus('en_cours');
    setActiveTab('declarations');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const handleEditDeclaration = (declaration: Declaration) => {
    setEditingDeclaration(declaration);
  };

  const handleUpdateDeclaration = (updatedDeclaration: Declaration) => {
    setDeclarations(prev => prev.map(d => 
      d.id === updatedDeclaration.id ? updatedDeclaration : d
    ));
    setEditingDeclaration(null);
    toast.success('Déclaration mise à jour');
  };

  const handleDeleteDeclaration = (id: string) => {
    setDeclarations(prev => prev.filter(d => d.id !== id));
    toast.success('Déclaration supprimée');
  };

  const handleDeleteChauffeur = (id: string) => {
    setChauffeurs(prev => prev.filter(c => c.id !== id));
    toast.success('Chauffeur supprimé');
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

  if (activeTab === 'tracage') {
    return (
      <div>
        <Header onProfileClick={handleProfileClick} />
        <div className="p-6">
          <div className="flex items-center gap-4 mb-6">
            <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>
              ← Retour au tableau de bord
            </Button>
          </div>
          <TracageSection />
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
              variant={activeTab === 'declarations' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('declarations')}
            >
              <FileText className="mr-2 h-4 w-4" />
              Déclarations
            </Button>
            <Button
              variant={activeTab === 'chauffeurs' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('chauffeurs')}
            >
              <User className="mr-2 h-4 w-4" />
              Chauffeurs
            </Button>
            <Button
              variant={activeTab === 'tracage' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setActiveTab('tracage')}
            >
              <MapPin className="mr-2 h-4 w-4" />
              Traçage
            </Button>
          </nav>
        </div>

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tableau de bord - Planificateur</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card 
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={handleEnAttenteClick}
                >
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">En Attente de Validation</CardTitle>
                    <FileText className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
                    <p className="text-xs text-muted-foreground">Cliquez pour filtrer</p>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Déclarations récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {declarations.slice(0, 5).map((declaration) => (
                      <div key={declaration.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <div className="font-medium">{declaration.number}</div>
                          <div className="text-sm text-gray-500">
                            {declaration.chauffeurName} - {declaration.month}/{declaration.year}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(declaration.status)}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'declarations' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Déclarations</h2>
              </div>

              <SearchAndFilter
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                filterValue={filterStatus}
                onFilterChange={setFilterStatus}
                filterOptions={[
                  { value: 'en_cours', label: 'En Attente' },
                  { value: 'valide', label: 'Validé' },
                  { value: 'refuse', label: 'Refusé' }
                ]}
                searchPlaceholder="Rechercher par numéro ou chauffeur..."
                filterPlaceholder="Filtrer par statut..."
              />

              <Card>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[140px]">Numéro</TableHead>
                        <TableHead className="w-[130px]">Chauffeur</TableHead>
                        <TableHead className="w-[80px]">Distance</TableHead>
                        <TableHead className="w-[100px]">Frais (DZD)</TableHead>
                        <TableHead className="w-[100px]">Créé le</TableHead>
                        <TableHead className="w-[100px]">Validé le</TableHead>
                        <TableHead className="w-[80px]">État</TableHead>
                        <TableHead className="w-[120px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeclarations.map((declaration) => (
                        <TableRow key={declaration.id}>
                          <TableCell className="font-medium">
                            <div className="truncate text-sm">{declaration.number}</div>
                          </TableCell>
                          <TableCell>
                            <div className="truncate text-sm">{declaration.chauffeurName}</div>
                          </TableCell>
                          <TableCell className="text-center text-sm">
                            {declaration.distance || '-'}
                          </TableCell>
                          <TableCell className="text-right text-sm">
                            {declaration.deliveryFees ? 
                              `${Math.round(declaration.deliveryFees / 1000)}k` : '-'}
                          </TableCell>
                          <TableCell className="text-sm">
                            {new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                              day: '2-digit',
                              month: '2-digit'
                            })}
                          </TableCell>
                          <TableCell className="text-sm">
                            {declaration.validatedAt 
                              ? new Date(declaration.validatedAt).toLocaleDateString('fr-FR', {
                                  day: '2-digit',
                                  month: '2-digit'
                                })
                              : '-'
                            }
                          </TableCell>
                          <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleEditDeclaration(declaration)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-7 w-7 p-0"
                                onClick={() => handleDeleteDeclaration(declaration.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                              {declaration.status === 'en_cours' && (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 w-7 p-0 text-green-600 hover:text-green-700"
                                    onClick={() => handleValidateDeclaration(declaration.id)}
                                  >
                                    <Check className="h-3 w-3" />
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline" 
                                    className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                    onClick={() => handleRejectDeclaration(declaration.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </>
                              )}
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

          {activeTab === 'chauffeurs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Chauffeurs</h2>
                <Dialog open={showCreateChauffeur} onOpenChange={setShowCreateChauffeur}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      Ajouter un chauffeur
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>
                        {editingChauffeur ? 'Modifier le chauffeur' : 'Créer un nouveau chauffeur'}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateChauffeur} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            value={newChauffeur.firstName}
                            onChange={(e) => setNewChauffeur({ ...newChauffeur, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            value={newChauffeur.lastName}
                            onChange={(e) => setNewChauffeur({ ...newChauffeur, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur *</Label>
                        <Input
                          id="username"
                          value={newChauffeur.username}
                          onChange={(e) => setNewChauffeur({ ...newChauffeur, username: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="password">Mot de passe *</Label>
                        <Input
                          id="password"
                          type="password"
                          value={newChauffeur.password}
                          onChange={(e) => setNewChauffeur({ ...newChauffeur, password: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <PhoneNumbersField
                          phones={newChauffeur.phone}
                          onChange={(phones) => setNewChauffeur({ ...newChauffeur, phone: phones })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="vehicleType">Type de véhicule</Label>
                        <Select value={newChauffeur.vehicleType} onValueChange={(value) => setNewChauffeur({ ...newChauffeur, vehicleType: value })}>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionner un type" />
                          </SelectTrigger>
                          <SelectContent>
                            {vehicleTypes.map((type) => (
                              <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="employeeType">Type d'employé</Label>
                        <Select value={newChauffeur.employeeType} onValueChange={(value: 'interne' | 'externe') => setNewChauffeur({ ...newChauffeur, employeeType: value })}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="interne">Interne</SelectItem>
                            <SelectItem value="externe">Externe</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingChauffeur ? 'Modifier' : 'Créer'}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCreateChauffeur(false);
                          setEditingChauffeur(null);
                          setNewChauffeur({
                            firstName: '',
                            lastName: '',
                            username: '',
                            password: '',
                            phone: [''],
                            vehicleType: '',
                            employeeType: 'interne'
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
                        <TableHead className="w-[160px]">Nom complet</TableHead>
                        <TableHead className="w-[120px]">Utilisateur</TableHead>
                        <TableHead className="w-[100px]">Mot de passe</TableHead>
                        <TableHead className="w-[140px]">Téléphone</TableHead>
                        <TableHead className="w-[110px]">Véhicule</TableHead>
                        <TableHead className="w-[80px]">Type</TableHead>
                        <TableHead className="w-[80px]">Statut</TableHead>
                        <TableHead className="w-[100px]">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {chauffeurs.map((chauffeur) => (
                        <TableRow key={chauffeur.id}>
                          <TableCell className="font-medium">
                            <div className="truncate">
                              {chauffeur.employeeType === 'externe' ? 'TP - ' : ''}{chauffeur.firstName} {chauffeur.lastName}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="truncate text-sm">{chauffeur.username}</div>
                          </TableCell>
                          <TableCell>
                            <PasswordField password={chauffeur.password} showLabel={false} />
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {chauffeur.phone.map((p, index) => (
                                <div key={index} className="text-sm truncate">{p}</div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm truncate">{chauffeur.vehicleType || '-'}</div>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {chauffeur.employeeType === 'interne' ? 'Int.' : 'Ext.'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={chauffeur.isActive ? 'default' : 'secondary'}
                              className="text-xs"
                            >
                              {chauffeur.isActive ? 'Actif' : 'Inactif'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-1">
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleEditChauffeur(chauffeur)}
                              >
                                <Edit className="h-3 w-3" />
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="h-8 w-8 p-0"
                                onClick={() => handleDeleteChauffeur(chauffeur.id)}
                              >
                                <Trash2 className="h-3 w-3" />
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

      <EditDeclarationDialog
        declaration={editingDeclaration}
        isOpen={!!editingDeclaration}
        onClose={() => setEditingDeclaration(null)}
        onSave={handleUpdateDeclaration}
      />
    </div>
  );
};

export default PlanificateurDashboard;
