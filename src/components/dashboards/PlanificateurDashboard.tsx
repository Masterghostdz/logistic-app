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
  Eye, 
  User, 
  MapPin,
  Settings,
  ClipboardList
} from 'lucide-react';
import { Declaration, Chauffeur } from '../../types';
import SearchAndFilter from '../SearchAndFilter';
import ProfilePage from '../ProfilePage';
import TracageSection from '../TracageSection';

const PlanificateurDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [declarations, setDeclarations] = useState<Declaration[]>([
    {
      id: '1',
      number: 'DECL-2024-001',
      programNumber: 'PROG-001',
      year: '2024',
      month: 'Janvier',
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
      number: 'DECL-2024-002',
      programNumber: 'PROG-002',
      year: '2024',
      month: 'Février',
      chauffeurId: '2',
      chauffeurName: 'Fatima Said',
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
      number: 'DECL-2024-003',
      programNumber: 'PROG-001',
      year: '2024',
      month: 'Janvier',
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
      number: 'DECL-2024-004',
      programNumber: 'PROG-003',
      year: '2024',
      month: 'Mars',
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
    },
    {
      id: '5',
      number: 'DECL-2024-005',
      programNumber: 'PROG-002',
      year: '2024',
      month: 'Février',
      chauffeurId: '2',
      chauffeurName: 'Fatima Said',
      distance: 1500,
      deliveryFees: 90000,
      notes: 'Livraison effectuée sans incident',
      photos: [],
      status: 'valide',
      createdAt: '2024-02-10T12:00:00Z',
      validatedAt: '2024-02-12T15:45:00Z',
      validatedBy: 'Planificateur'
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
      phone: '+213 55 12 34 56',
      vehicleType: 'Camion 3.5T',
      employeeType: 'interne',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      firstName: 'Fatima',
      lastName: 'Said',
      fullName: 'Fatima Said',
      username: 'fsaid',
      password: 'demo123',
      phone: '+213 66 98 76 54',
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
      phone: '+213 77 55 44 33',
      vehicleType: 'Utilitaire',
      employeeType: 'interne',
      isActive: false,
      createdAt: new Date().toISOString()
    }
  ]);

  const [filterStatus, setFilterStatus] = useState<string>('');
  const [showCreateChauffeur, setShowCreateChauffeur] = useState(false);
  const [newChauffeur, setNewChauffeur] = useState({
    firstName: '',
    lastName: '',
    username: '',
    password: '',
    phone: '',
    vehicleType: '',
    employeeType: 'interne' as 'interne' | 'externe'
  });

  // Statistiques
  const stats = useMemo(() => {
    const enAttente = declarations.filter(d => d.status === 'en_cours').length;
    
    return {
      enAttente
    };
  }, [declarations]);

  // Filtrage des déclarations
  const filteredDeclarations = useMemo(() => {
    return declarations.filter(declaration => {
      if (filterStatus && filterStatus !== 'tous' && declaration.status !== filterStatus) {
        return false;
      }
      return true;
    });
  }, [declarations, filterStatus]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800">En Attente</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleCreateChauffeur = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChauffeur.firstName || !newChauffeur.lastName || !newChauffeur.username || !newChauffeur.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const chauffeur: Chauffeur = {
      id: Date.now().toString(),
      firstName: newChauffeur.firstName,
      lastName: newChauffeur.lastName,
      fullName: `${newChauffeur.firstName} ${newChauffeur.lastName}`,
      username: newChauffeur.username,
      password: newChauffeur.password,
      phone: newChauffeur.phone,
      vehicleType: newChauffeur.vehicleType,
      employeeType: newChauffeur.employeeType,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    setChauffeurs(prev => [...prev, chauffeur]);
    setNewChauffeur({
      firstName: '',
      lastName: '',
      username: '',
      password: '',
      phone: '',
      vehicleType: '',
      employeeType: 'interne'
    });
    setShowCreateChauffeur(false);
    toast.success('Chauffeur créé avec succès');
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

  if (activeTab === 'profile') {
    return <ProfilePage onBack={() => setActiveTab('dashboard')} />;
  }

  if (activeTab === 'tracage') {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="ghost" onClick={() => setActiveTab('dashboard')}>
            ← Retour au tableau de bord
          </Button>
        </div>
        <TracageSection />
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      {/* Sidebar */}
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
          <Button
            variant={activeTab === 'profile' ? 'default' : 'ghost'}
            className="w-full justify-start"
            onClick={() => setActiveTab('profile')}
          >
            <Settings className="mr-2 h-4 w-4" />
            Profil
          </Button>
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 overflow-auto">
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold">Tableau de bord - Planificateur</h1>
            </div>

            {/* Statistiques */}
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

            {/* Déclarations récentes */}
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
                          {declaration.chauffeurName} - {declaration.month} {declaration.year}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(declaration.status)}
                        <Button size="sm" variant="outline">
                          <Eye className="h-4 w-4" />
                        </Button>
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
              onFilterChange={(filters) => {
                setFilterStatus(filters.status || '');
              }}
              statusOptions={[
                { value: 'tous', label: 'Tous' },
                { value: 'en_cours', label: 'En Attente' },
                { value: 'valide', label: 'Validé' },
                { value: 'refuse', label: 'Refusé' }
              ]}
            />

            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Chauffeur</TableHead>
                      <TableHead>Période</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Frais</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeclarations.map((declaration) => (
                      <TableRow key={declaration.id}>
                        <TableCell className="font-medium">{declaration.number}</TableCell>
                        <TableCell>{declaration.chauffeurName}</TableCell>
                        <TableCell>{declaration.month} {declaration.year}</TableCell>
                        <TableCell>{declaration.distance} km</TableCell>
                        <TableCell>{declaration.deliveryFees?.toLocaleString()} DA</TableCell>
                        <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              <Eye className="h-4 w-4" />
                            </Button>
                            {declaration.status === 'en_cours' && (
                              <>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-green-600 hover:text-green-700"
                                  onClick={() => handleValidateDeclaration(declaration.id)}
                                >
                                  <Check className="h-4 w-4" />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline" 
                                  className="text-red-600 hover:text-red-700"
                                  onClick={() => handleRejectDeclaration(declaration.id)}
                                >
                                  <X className="h-4 w-4" />
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
                    <DialogTitle>Créer un nouveau chauffeur</DialogTitle>
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
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input
                        id="phone"
                        value={newChauffeur.phone}
                        onChange={(e) => setNewChauffeur({ ...newChauffeur, phone: e.target.value })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="vehicleType">Type de véhicule</Label>
                      <Select value={newChauffeur.vehicleType} onValueChange={(value) => setNewChauffeur({ ...newChauffeur, vehicleType: value })}>
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner un type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Camion 3.5T">Camion 3.5T</SelectItem>
                          <SelectItem value="Camionnette">Camionnette</SelectItem>
                          <SelectItem value="Utilitaire">Utilitaire</SelectItem>
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
                      <Button type="submit" className="flex-1">Créer</Button>
                      <Button type="button" variant="outline" onClick={() => setShowCreateChauffeur(false)}>
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
                      <TableHead>Téléphone</TableHead>
                      <TableHead>Type de véhicule</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {chauffeurs.map((chauffeur) => (
                      <TableRow key={chauffeur.id}>
                        <TableCell className="font-medium">{chauffeur.fullName}</TableCell>
                        <TableCell>{chauffeur.phone}</TableCell>
                        <TableCell>{chauffeur.vehicleType}</TableCell>
                        <TableCell>
                          <Badge variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}>
                            {chauffeur.employeeType === 'interne' ? 'Interne' : 'Externe'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={chauffeur.isActive ? 'default' : 'secondary'}>
                            {chauffeur.isActive ? 'Actif' : 'Inactif'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline">
                            <Eye className="h-4 w-4" />
                          </Button>
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
  );
};

export default PlanificateurDashboard;
