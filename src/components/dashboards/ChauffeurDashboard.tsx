
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/SharedDataContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MapPin, Plus, Clock, Search, Edit, Trash2 } from 'lucide-react';
import { Declaration, Warehouse } from '../../types';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import OpenStreetMap from '../OpenStreetMap';
import SearchAndFilter from '../SearchAndFilter';
import EditDeclarationDialog from '../EditDeclarationDialog';
import Header from '../Header';
import ProfilePage from '../ProfilePage';

const ChauffeurDashboard = () => {
  const { user } = useAuth();
  const { declarations, addDeclaration, updateDeclaration, deleteDeclaration } = useSharedData();
  const { t } = useTranslation();
  
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    distance: '',
    deliveryFees: '',
    notes: '',
    number: '',
    year: '',
    month: '',
    programNumber: ''
  });

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Entrepôts pour la carte
  const [warehouses] = useState<Warehouse[]>([
    {
      id: '1',
      name: 'Entrepôt Principal Alger',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: ['+213 21 12 34 56'],
      address: '123 Rue des Entrepreneurs, Alger',
      coordinates: { lat: 36.7538, lng: 3.0588 },
      createdAt: new Date().toISOString()
    },
    {
      id: '2',
      name: 'Entrepôt Oran',
      companyId: '1',
      companyName: 'Logigrine Algérie',
      phone: ['+213 41 98 76 54'],
      address: '456 Boulevard Commercial, Oran',
      coordinates: { lat: 35.6969, lng: -0.6331 },
      createdAt: new Date().toISOString()
    }
  ]);

  useEffect(() => {
    if (user) {
      // Fetch declarations or perform other initialization logic here
    }
  }, [user]);

  const chauffeurDeclarations = declarations.filter(
    declaration => declaration.chauffeurId === user?.id
  );

  // Filter and search declarations
  const filteredDeclarations = chauffeurDeclarations.filter(declaration => {
    const matchesSearch = declaration.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         declaration.chauffeurName.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || declaration.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const filterOptions = [
    { value: 'en_cours', label: t('dashboard.pending') },
    { value: 'valide', label: t('dashboard.validated') },
    { value: 'refuse', label: t('dashboard.refused') }
  ];

  const handleCreateDeclaration = () => {
    // Vérifier que le numéro de programme est complètement rempli (4 chiffres)
    if (!formData.programNumber || formData.programNumber.length !== 4) {
      alert(t('declarations.programNumberRequired'));
      return;
    }

    // Vérifier qu'au moins la distance ou les frais de livraison sont renseignés
    if (!formData.distance && !formData.deliveryFees) {
      alert(t('declarations.distanceOrFeesRequired'));
      return;
    }

    const newDeclaration: Declaration = {
      id: Date.now().toString(),
      number: formData.number,
      year: formData.year,
      month: formData.month,
      programNumber: formData.programNumber,
      chauffeurId: user!.id,
      chauffeurName: user!.fullName,
      distance: formData.distance ? parseInt(formData.distance) : undefined,
      deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
      notes: formData.notes,
      status: 'en_cours',
      createdAt: new Date().toISOString()
    };

    addDeclaration(newDeclaration);
    
    // Reset form
    setFormData({
      distance: '',
      deliveryFees: '',
      notes: '',
      number: '',
      year: '',
      month: '',
      programNumber: ''
    });
    setIsCreating(false);
  };

  const handleNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, number }));
  };

  const handleComponentsChange = (year: string, month: string, programNumber: string) => {
    setFormData(prev => ({ 
      ...prev, 
      year, 
      month, 
      programNumber 
    }));
  };

  const handleEditDeclaration = (declaration: Declaration) => {
    setEditingDeclaration(declaration);
    setIsEditDialogOpen(true);
  };

  const handleSaveDeclaration = (updatedDeclaration: Declaration) => {
    updateDeclaration(updatedDeclaration.id, updatedDeclaration);
    setIsEditDialogOpen(false);
    setEditingDeclaration(null);
  };

  const handleDeleteDeclaration = (id: string) => {
    if (confirm(t('declarations.confirmDelete'))) {
      deleteDeclaration(id);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('dashboard.refused')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Si on affiche le profil, on rend seulement ProfilePage sans le header du tableau de bord
  if (showProfile) {
    return (
      <div className="min-h-screen bg-background">
        <Header onProfileClick={() => setShowProfile(false)} />
        <div className="container mx-auto p-6">
          <ProfilePage onBack={() => setShowProfile(false)} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onProfileClick={() => setShowProfile(true)} />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-foreground">
            {t('dashboard.chauffeurTitle')}
          </h1>
          <Badge variant="secondary" className="text-sm">
            {user?.fullName}
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Declaration Form */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Plus className="h-5 w-5" />
                {t('dashboard.newDeclaration')}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)} className="w-full">
                  {t('dashboard.createNewDeclaration')}
                </Button>
              ) : (
                <div className="space-y-4">
                  <SimpleDeclarationNumberForm
                    onNumberChange={handleNumberChange}
                    onComponentsChange={handleComponentsChange}
                  />
                  
                  <div>
                    <Label htmlFor="distance" className="text-foreground">{t('declarations.distance')}</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryFees" className="text-foreground">{t('declarations.deliveryFees')}</Label>
                    <Input
                      id="deliveryFees"
                      type="number"
                      value={formData.deliveryFees}
                      onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes" className="text-foreground">{t('declarations.notes')}</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                      className="bg-background border-border text-foreground"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateDeclaration} className="flex-1">
                      {t('forms.save')}
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setIsCreating(false);
                        setFormData({
                          distance: '',
                          deliveryFees: '',
                          notes: '',
                          number: '',
                          year: '',
                          month: '',
                          programNumber: ''
                        });
                      }}
                    >
                      {t('forms.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Declarations Summary */}
          <Card className="bg-card border-border">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-card-foreground">
                <Clock className="h-5 w-5" />
                {t('dashboard.myDeclarationsSummary')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <div className="text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                    {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                  </div>
                  <div className="text-sm text-yellow-600 dark:text-yellow-300">{t('dashboard.pending')}</div>
                </div>
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                  <div className="text-2xl font-bold text-green-700 dark:text-green-400">
                    {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                  </div>
                  <div className="text-sm text-green-600 dark:text-green-300">{t('dashboard.validated')}</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="text-2xl font-bold text-red-700 dark:text-red-400">
                    {chauffeurDeclarations.filter(d => d.status === 'refuse').length}
                  </div>
                  <div className="text-sm text-red-600 dark:text-red-300">{t('dashboard.refused')}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className="bg-border" />

        {/* Declarations List */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <Search className="h-5 w-5" />
              {t('dashboard.myDeclarations')} ({chauffeurDeclarations.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <SearchAndFilter
                searchValue={searchTerm}
                onSearchChange={setSearchTerm}
                filterValue={statusFilter}
                onFilterChange={setStatusFilter}
                filterOptions={filterOptions}
                searchPlaceholder={t('declarations.searchPlaceholder')}
                filterPlaceholder={t('declarations.filterPlaceholder')}
              />

              {filteredDeclarations.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  {searchTerm || statusFilter !== 'all' 
                    ? t('declarations.noDeclarationsWithFilters')
                    : t('declarations.noDeclarations')
                  }
                </div>
              ) : (
                <div className="rounded-md border border-border bg-card">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-border hover:bg-muted/50">
                        <TableHead className="text-foreground">{t('declarations.number')}</TableHead>
                        <TableHead className="text-foreground">{t('declarations.distance')}</TableHead>
                        <TableHead className="text-foreground">{t('declarations.deliveryFees')}</TableHead>
                        <TableHead className="text-foreground">{t('declarations.status')}</TableHead>
                        <TableHead className="text-foreground">{t('declarations.createdDate')}</TableHead>
                        <TableHead className="text-foreground">{t('declarations.actions')}</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredDeclarations.map((declaration) => (
                        <TableRow key={declaration.id} className="border-border hover:bg-muted/50">
                          <TableCell className="font-medium text-foreground">
                            {declaration.number}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {declaration.distance ? `${declaration.distance} km` : '-'}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                          </TableCell>
                          <TableCell>
                            {getStatusBadge(declaration.status)}
                          </TableCell>
                          <TableCell className="text-foreground">
                            {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              {declaration.status === 'en_cours' && (
                                <>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleEditDeclaration(declaration)}
                                  >
                                    <Edit className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => handleDeleteDeclaration(declaration.id)}
                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
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
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Separator className="bg-border" />

        {/* Interactive Map section */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-card-foreground">
              <MapPin className="h-5 w-5" />
              {t('dashboard.warehouseMap')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <OpenStreetMap 
              warehouses={warehouses}
              height="500px"
            />
          </CardContent>
        </Card>

        {/* Edit Declaration Dialog */}
        <EditDeclarationDialog
          declaration={editingDeclaration}
          isOpen={isEditDialogOpen}
          onClose={() => {
            setIsEditDialogOpen(false);
            setEditingDeclaration(null);
          }}
          onSave={handleSaveDeclaration}
        />
      </div>
    </div>
  );
};

export default ChauffeurDashboard;
