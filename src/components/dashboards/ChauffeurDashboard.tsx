import { useOnlineStatus } from '../../contexts/OnlineStatusContext';

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/SharedDataContext';
import { useTranslation } from '../../hooks/useTranslation';
// ...existing code...
import { useIsMobile } from '../../hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MapPin, Plus, Clock, Search, Edit, Trash2 } from 'lucide-react';
import ChauffeurSidebar from './ChauffeurSidebar';
import { Declaration, Warehouse } from '../../types';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import TracageSection from '../TracageSection';
import SearchAndFilter from '../SearchAndFilter';
import EditDeclarationDialog from '../EditDeclarationDialog';
import Header from '../Header';
import ProfilePage from '../ProfilePage';

const ChauffeurDashboard = () => {
  const { isOnline } = useOnlineStatus();
  const { user } = useAuth();
  const { declarations, addDeclaration, updateDeclaration, deleteDeclaration } = useSharedData();
  const { t, settings } = useTranslation();
  const isMobile = settings?.viewMode === 'mobile';
  
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

  const [searchTerm, setSearchTerm] = useState('');

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
      <div className="min-h-screen bg-background w-full overflow-x-hidden">
        <Header onProfileClick={() => setShowProfile(false)} />
        <div className="container mx-auto p-2 sm:p-4 md:p-6 max-w-full">
          <ProfilePage onBack={() => setShowProfile(false)} />
        </div>
      </div>
    );
  }

  // Navigation state for Chauffeur: dashboard/tracage only
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracage'>('dashboard');

  return (
    <div className={isMobile ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'min-h-screen bg-background w-full overflow-x-hidden'}>
      <Header onProfileClick={() => setShowProfile(true)} />
      {/* Badge En ligne : mobile sous le header, desktop en haut à droite (absolute, hors sidebar) */}
      {isMobile ? (
        <div className="flex px-2 pt-3 mb-2">
          <span
            className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
            title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            En ligne
          </span>
        </div>
      ) : null}
      {isMobile ? (
        <div className="flex flex-col flex-1">
          <ChauffeurSidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as 'dashboard' | 'tracage')} />
          <main className="flex-1">
            {activeTab === 'dashboard' && (
              <div className="max-w-[430px] mx-auto w-full p-4">
                <h1 className="text-2xl font-bold text-foreground mb-6">{t('dashboard.chauffeurTitle')}</h1>
                {/* Résumé au-dessus du formulaire en mobile */}
                <Card className="bg-card border-border w-full mb-4">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                      <Clock className="h-4 w-4" />
                      {t('dashboard.myDeclarationsSummary')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-3 gap-2 text-center">
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                          {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-300">{t('dashboard.pending')}</div>
                      </div>
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400">
                          {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300">{t('dashboard.validated')}</div>
                      </div>
                      <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                        <div className="text-xl font-bold text-red-700 dark:text-red-400">
                          {chauffeurDeclarations.filter(d => d.status === 'refuse').length}
                        </div>
                        <div className="text-xs text-red-600 dark:text-red-300">{t('dashboard.refused')}</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                {/* Formulaire de déclaration en dessous */}
                <Card className="bg-card border-border w-full">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                      <Plus className="h-4 w-4" />
                      {t('dashboard.newDeclaration')}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isCreating ? (
                      <Button onClick={() => setIsCreating(true)} className="w-full text-sm">
                        {t('dashboard.createNewDeclaration')}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        <SimpleDeclarationNumberForm
                          onNumberChange={handleNumberChange}
                          onComponentsChange={handleComponentsChange}
                        />
                        <div>
                          <Label htmlFor="distance" className="text-foreground text-sm">{t('declarations.distance')}</Label>
                          <Input
                            id="distance"
                            type="number"
                            value={formData.distance}
                            onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                            className="bg-background border-border text-foreground text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="deliveryFees" className="text-foreground text-sm">{t('declarations.deliveryFees')}</Label>
                          <Input
                            id="deliveryFees"
                            type="number"
                            value={formData.deliveryFees}
                            onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                            className="bg-background border-border text-foreground text-sm w-full mt-1"
                          />
                        </div>
                        <div>
                          <Label htmlFor="notes" className="text-foreground text-sm">{t('declarations.notes')}</Label>
                          <Textarea
                            id="notes"
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                            rows={3}
                            className="bg-background border-border text-foreground text-sm w-full mt-1 resize-none"
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <Button onClick={handleCreateDeclaration} className="flex-1 text-sm">
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
                            className="flex-1 text-sm"
                          >
                            {t('forms.cancel')}
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
                <Separator className="bg-border mt-4" />
                {/* Declarations List */}
                <div className="mt-4">
                  <Card className="bg-card border-border w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
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
                          searchColumn="number"
                          onSearchColumnChange={() => {}}
                          searchColumnOptions={[
                            { value: 'number', label: t('declarations.number') },
                            { value: 'notes', label: t('declarations.notes') },
                            { value: 'chauffeurName', label: t('declarations.chauffeurName') }
                          ]}
                        />
                        {filteredDeclarations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            {searchTerm || statusFilter !== 'all' 
                              ? t('declarations.noDeclarationsWithFilters')
                              : t('declarations.noDeclarations')
                            }
                          </div>
                        ) : (
                          <div className="w-full overflow-x-auto">
                            <div className="rounded-md border border-border bg-card min-w-full">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.number')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.distance')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.deliveryFees')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.status')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.createdDate')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.actions')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredDeclarations.map((declaration) => (
                                    <TableRow key={declaration.id} className="border-border hover:bg-muted/50">
                                      <TableCell className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.number}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.distance ? `${declaration.distance} km` : '-'}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        {getStatusBadge(declaration.status)}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        <div className="flex gap-1 sm:gap-2">
                                          {declaration.status === 'en_cours' && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setEditingDeclaration(declaration);
                                                  setIsEditDialogOpen(true);
                                                }}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  if (window.confirm(t('declarations.confirmDelete'))) {
                                                    deleteDeclaration(declaration.id);
                                                  }
                                                }}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                                              >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {activeTab === 'tracage' && (
              <div className={isMobile ? 'max-w-[430px] mx-auto w-full p-4' : 'p-6 pt-8'}>
                <h1 className="text-2xl font-bold text-foreground mb-6">Traçage des Entrepôts</h1>
                <TracageSection />
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-4rem)] relative">
          {/* Badge En ligne en haut à droite, absolute, hors sidebar */}
          <span
            className="absolute top-0 right-0 m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
            title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            En ligne
          </span>
          <ChauffeurSidebar activeTab={activeTab} onTabChange={(tab) => setActiveTab(tab as 'dashboard' | 'tracage')} />
          <div className="flex-1 p-6 pt-16 overflow-auto">
            {/* ...existing code for dashboard/tracage/content... */}
            {activeTab === 'dashboard' && (
              <>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
                  <h1 className="text-2xl font-bold text-foreground">{t('dashboard.chauffeurTitle')}</h1>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 mt-4">
                  {/* Create Declaration Form */}
                  <Card className="bg-card border-border w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('dashboard.newDeclaration')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {!isCreating ? (
                        <Button onClick={() => setIsCreating(true)} className="w-full text-sm sm:text-base">
                          {t('dashboard.createNewDeclaration')}
                        </Button>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <SimpleDeclarationNumberForm
                            onNumberChange={handleNumberChange}
                            onComponentsChange={handleComponentsChange}
                          />
                          <div>
                            <Label htmlFor="distance" className="text-foreground text-sm">{t('declarations.distance')}</Label>
                            <Input
                              id="distance"
                              type="number"
                              value={formData.distance}
                              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                              className="bg-background border-border text-foreground text-sm w-full mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="deliveryFees" className="text-foreground text-sm">{t('declarations.deliveryFees')}</Label>
                            <Input
                              id="deliveryFees"
                              type="number"
                              value={formData.deliveryFees}
                              onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                              className="bg-background border-border text-foreground text-sm w-full mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="notes" className="text-foreground text-sm">{t('declarations.notes')}</Label>
                            <Textarea
                              id="notes"
                              value={formData.notes}
                              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                              rows={3}
                              className="bg-background border-border text-foreground text-sm w-full mt-1 resize-none"
                            />
                          </div>
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button onClick={handleCreateDeclaration} className="flex-1 text-sm">
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
                              className="flex-1 sm:flex-none text-sm"
                            >
                              {t('forms.cancel')}
                            </Button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                  {/* My Declarations Summary */}
                  <Card className="bg-card border-border w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                        <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('dashboard.myDeclarationsSummary')}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 sm:gap-4 text-center">
                        <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                            {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                          </div>
                          <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300">{t('dashboard.pending')}</div>
                        </div>
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                            {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                          </div>
                          <div className="text-xs sm:text-sm text-green-600 dark:text-green-300">{t('dashboard.validated')}</div>
                        </div>
                        <div className="p-3 sm:p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                          <div className="text-xl sm:text-2xl font-bold text-red-700 dark:text-red-400">
                            {chauffeurDeclarations.filter(d => d.status === 'refuse').length}
                          </div>
                          <div className="text-xs sm:text-sm text-red-600 dark:text-red-300">{t('dashboard.refused')}</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
                <Separator className="bg-border mt-4" />
                {/* Declarations List */}
                <div className="mt-4">
                  <Card className="bg-card border-border w-full">
                    <CardHeader className="pb-3">
                      <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                        <Search className="h-4 w-4 sm:h-5 sm:w-5" />
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
                          searchColumn="number"
                          onSearchColumnChange={() => {}}
                          searchColumnOptions={[
                            { value: 'number', label: t('declarations.number') },
                            { value: 'notes', label: t('declarations.notes') },
                            { value: 'chauffeurName', label: t('declarations.chauffeurName') }
                          ]}
                        />
                        {filteredDeclarations.length === 0 ? (
                          <div className="text-center py-8 text-muted-foreground text-sm">
                            {searchTerm || statusFilter !== 'all' 
                              ? t('declarations.noDeclarationsWithFilters')
                              : t('declarations.noDeclarations')
                            }
                          </div>
                        ) : (
                          <div className="w-full overflow-x-auto">
                            <div className="rounded-md border border-border bg-card min-w-full">
                              <Table>
                                <TableHeader>
                                  <TableRow className="border-border hover:bg-muted/50">
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.number')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.distance')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.deliveryFees')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.status')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.createdDate')}</TableHead>
                                    <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.actions')}</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {filteredDeclarations.map((declaration) => (
                                    <TableRow key={declaration.id} className="border-border hover:bg-muted/50">
                                      <TableCell className="font-medium text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.number}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.distance ? `${declaration.distance} km` : '-'}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        {getStatusBadge(declaration.status)}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        <div className="flex gap-1 sm:gap-2">
                                          {declaration.status === 'en_cours' && (
                                            <>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  setEditingDeclaration(declaration);
                                                  setIsEditDialogOpen(true);
                                                }}
                                                className="h-8 w-8 p-0"
                                              >
                                                <Edit className="h-3 w-3 sm:h-4 sm:w-4" />
                                              </Button>
                                              <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => {
                                                  if (window.confirm(t('declarations.confirmDelete'))) {
                                                    deleteDeclaration(declaration.id);
                                                  }
                                                }}
                                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                                              >
                                                <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
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
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}
            {activeTab === 'tracage' && (
              <TracageSection />
            )}
          </div>
        </div>
      )}
      {/* Edit Declaration Dialog (always available) */}
      <EditDeclarationDialog
        declaration={editingDeclaration}
        isOpen={isEditDialogOpen}
        onClose={() => {
          setIsEditDialogOpen(false);
          setEditingDeclaration(null);
        }}
        onSave={(updated) => {
          if (editingDeclaration) {
            updateDeclaration(editingDeclaration.id, { ...editingDeclaration, ...updated });
            setIsEditDialogOpen(false);
          }
        }}
      />
    </div>
  );
}

export default ChauffeurDashboard;
