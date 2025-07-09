import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Declaration, Warehouse } from '../../types';
import { Plus, FileText, MapPin, Camera, Edit, Trash2, Clock, CheckCircle, XCircle, User } from 'lucide-react';
import { toast } from 'sonner';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import OpenStreetMap from '../OpenStreetMap';
import ProfilePage from '../ProfilePage';
import Header from '../Header';

const ChauffeurDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [activeView, setActiveView] = useState('dashboard');
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [showNewDeclaration, setShowNewDeclaration] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [formData, setFormData] = useState({
    declarationNumber: '',
    year: '',
    month: '',
    programNumber: '',
    distance: '',
    deliveryFees: '',
    notes: '',
    photos: [] as string[]
  });

  const [warehouses] = useState<Warehouse[]>([
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

  useEffect(() => {
    // Charger les déclarations du chauffeur depuis localStorage
    const savedDeclarations = localStorage.getItem(`declarations_${user?.id}`);
    if (savedDeclarations) {
      setDeclarations(JSON.parse(savedDeclarations));
    }
  }, [user?.id]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.declarationNumber) {
      toast.error('Veuillez générer un numéro de déclaration valide');
      return;
    }

    if (editingDeclaration) {
      // Modification d'une déclaration existante
      const updatedDeclaration: Declaration = {
        ...editingDeclaration,
        programNumber: formData.programNumber,
        year: formData.year,
        month: formData.month,
        distance: formData.distance ? parseInt(formData.distance) : undefined,
        deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
        notes: formData.notes,
        photos: formData.photos
      };

      const updatedDeclarations = declarations.map(d => 
        d.id === editingDeclaration.id ? updatedDeclaration : d
      );
      setDeclarations(updatedDeclarations);
      localStorage.setItem(`declarations_${user?.id}`, JSON.stringify(updatedDeclarations));
      setEditingDeclaration(null);
      toast.success('Déclaration mise à jour');
    } else {
      // Création d'une nouvelle déclaration
      const newDeclaration: Declaration = {
        id: Date.now().toString(),
        number: formData.declarationNumber,
        programNumber: formData.programNumber,
        year: formData.year,
        month: formData.month,
        chauffeurId: user?.id || '',
        chauffeurName: `${user?.firstName} ${user?.lastName}`,
        distance: formData.distance ? parseInt(formData.distance) : undefined,
        deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
        notes: formData.notes,
        photos: formData.photos,
        status: 'en_cours',
        createdAt: new Date().toISOString()
      };

      const updatedDeclarations = [...declarations, newDeclaration];
      setDeclarations(updatedDeclarations);
      localStorage.setItem(`declarations_${user?.id}`, JSON.stringify(updatedDeclarations));
      toast.success(t('forms.success'));
    }
    
    // Réinitialiser le formulaire
    setFormData({
      declarationNumber: '',
      year: '',
      month: '',
      programNumber: '',
      distance: '',
      deliveryFees: '',
      notes: '',
      photos: []
    });
    
    setShowNewDeclaration(false);
  };

  const handleEdit = (declaration: Declaration) => {
    if (declaration.status !== 'en_cours') {
      toast.error('Seules les déclarations en cours peuvent être modifiées');
      return;
    }

    setEditingDeclaration(declaration);
    setFormData({
      declarationNumber: declaration.number,
      year: declaration.year,
      month: declaration.month,
      programNumber: declaration.programNumber,
      distance: declaration.distance?.toString() || '',
      deliveryFees: declaration.deliveryFees?.toString() || '',
      notes: declaration.notes || '',
      photos: declaration.photos || []
    });
    setShowNewDeclaration(true);
  };

  const handleDelete = (id: string) => {
    const declaration = declarations.find(d => d.id === id);
    if (declaration?.status !== 'en_cours') {
      toast.error('Seules les déclarations en cours peuvent être supprimées');
      return;
    }

    const updatedDeclarations = declarations.filter(d => d.id !== id);
    setDeclarations(updatedDeclarations);
    localStorage.setItem(`declarations_${user?.id}`, JSON.stringify(updatedDeclarations));
    toast.success('Déclaration supprimée');
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Clock className="h-4 w-4 text-orange-500" />;
      case 'valide':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'refuse':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-orange-100 text-orange-800">En Cours</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800">Validé</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800">Refusé</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const handleWarehouseClick = (warehouse: Warehouse) => {
    toast.info(`Entrepôt: ${warehouse.name} - ${warehouse.address}`);
  };

  const handleProfileClick = () => {
    setActiveView('profile');
  };

  if (activeView === 'profile') {
    return (
      <div>
        <Header onProfileClick={handleProfileClick} />
        <div className="p-6">
          <ProfilePage onBack={() => setActiveView('dashboard')} />
        </div>
      </div>
    );
  }

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => d.status === 'en_cours').length,
    validated: declarations.filter(d => d.status === 'valide').length,
    refused: declarations.filter(d => d.status === 'refuse').length
  };

  return (
    <div>
      <Header onProfileClick={handleProfileClick} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {t('nav.dashboard')}
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              {t('header.welcome')}, {user?.firstName}
            </p>
          </div>
          <Dialog open={showNewDeclaration} onOpenChange={setShowNewDeclaration}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                {editingDeclaration ? 'Modifier la déclaration' : t('declarations.new')}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingDeclaration ? 'Modifier la déclaration' : t('declarations.new')}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <SimpleDeclarationNumberForm
                  onNumberChange={(number) => setFormData({...formData, declarationNumber: number})}
                  onComponentsChange={(year, month, programNumber) => 
                    setFormData({...formData, year, month, programNumber})
                  }
                  initialYear={formData.year}
                  initialMonth={formData.month}
                  initialProgramNumber={formData.programNumber}
                />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="distance">{t('declarations.distance')}</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({...formData, distance: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <Label htmlFor="deliveryFees">Frais de Livraison (DZD)</Label>
                    <Input
                      id="deliveryFees"
                      type="number"
                      value={formData.deliveryFees}
                      onChange={(e) => setFormData({...formData, deliveryFees: e.target.value})}
                      placeholder="0"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="notes">{t('declarations.notes')}</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    placeholder={t('declarations.notes')}
                    rows={3}
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowNewDeclaration(false);
                    setEditingDeclaration(null);
                    setFormData({
                      declarationNumber: '',
                      year: '',
                      month: '',
                      programNumber: '',
                      distance: '',
                      deliveryFees: '',
                      notes: '',
                      photos: []
                    });
                  }}>
                    {t('forms.cancel')}
                  </Button>
                  <Button type="submit">
                    {editingDeclaration ? 'Modifier' : t('forms.save')}
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
                Total Déclarations
              </CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                En Cours
              </CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Validé
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.validated}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Refusé
              </CardTitle>
              <XCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.refused}</div>
            </CardContent>
          </Card>
        </div>

        {/* Liste des déclarations */}
        <Card>
          <CardHeader>
            <CardTitle>Mes Déclarations</CardTitle>
            <CardDescription>
              Historique de vos déclarations de programmes
            </CardDescription>
          </CardHeader>
          <CardContent>
            {declarations.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Aucune déclaration trouvée. Créez votre première déclaration !
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Numéro du Programme</TableHead>
                    <TableHead>Distance (km)</TableHead>
                    <TableHead>Frais de Livraison (DZD)</TableHead>
                    <TableHead>Date de Déclaration</TableHead>
                    <TableHead>Date de Validation</TableHead>
                    <TableHead>État</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {declarations.map((declaration) => (
                    <TableRow key={declaration.id}>
                      <TableCell className="font-medium">{declaration.number}</TableCell>
                      <TableCell>{declaration.distance || '-'}</TableCell>
                      <TableCell>{declaration.deliveryFees?.toLocaleString() || '-'}</TableCell>
                      <TableCell>{new Date(declaration.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell>
                        {declaration.validatedAt 
                          ? new Date(declaration.validatedAt).toLocaleDateString() 
                          : '-'
                        }
                      </TableCell>
                      <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          {declaration.status === 'en_cours' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleEdit(declaration)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDelete(declaration.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Carte des entrepôts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Carte des Entrepôts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OpenStreetMap 
              warehouses={warehouses}
              height="500px"
              onWarehouseClick={handleWarehouseClick}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChauffeurDashboard;
