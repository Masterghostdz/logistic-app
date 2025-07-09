import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/SharedDataContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MapPin, Plus, Clock, Search, Edit, Trash2, User } from 'lucide-react';
import { Declaration, Warehouse } from '../../types';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import OpenStreetMap from '../OpenStreetMap';
import SearchAndFilter from '../SearchAndFilter';
import EditDeclarationDialog from '../EditDeclarationDialog';
import ProfilePage from '../ProfilePage';
import Header from '../Header';

const ChauffeurDashboard = () => {
  const { user } = useAuth();
  const { declarations, addDeclaration, updateDeclaration, deleteDeclaration } = useSharedData();
  
  const [isCreating, setIsCreating] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
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

  // Si on affiche le profil, on rend ProfilePage
  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

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
    { value: 'en_cours', label: 'En Attente' },
    { value: 'valide', label: 'Validé' },
    { value: 'refuse', label: 'Refusé' }
  ];

  const handleCreateDeclaration = () => {
    // Vérifier que le numéro de programme est complètement rempli (4 chiffres)
    if (!formData.programNumber || formData.programNumber.length !== 4) {
      alert('Le numéro de programme doit contenir 4 chiffres');
      return;
    }

    // Vérifier qu'au moins la distance ou les frais de livraison sont renseignés
    if (!formData.distance && !formData.deliveryFees) {
      alert('Veuillez renseigner soit la distance soit les frais de livraison');
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
    if (confirm('Êtes-vous sûr de vouloir supprimer cette déclaration ?')) {
      deleteDeclaration(id);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-3xl font-bold text-gray-900">
              Tableau de bord - Chauffeur
            </h1>
            <Badge variant="secondary" className="text-sm">
              {user?.fullName}
            </Badge>
          </div>
          <Button
            variant="outline"
            onClick={() => setShowProfile(true)}
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            Mon Profil
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Create Declaration Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                Nouvelle Déclaration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {!isCreating ? (
                <Button onClick={() => setIsCreating(true)} className="w-full">
                  Créer une nouvelle déclaration
                </Button>
              ) : (
                <div className="space-y-4">
                  <SimpleDeclarationNumberForm
                    onNumberChange={handleNumberChange}
                    onComponentsChange={handleComponentsChange}
                  />
                  
                  <div>
                    <Label htmlFor="distance">Distance (km)</Label>
                    <Input
                      id="distance"
                      type="number"
                      value={formData.distance}
                      onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="deliveryFees">Frais de livraison (DZD)</Label>
                    <Input
                      id="deliveryFees"
                      type="number"
                      value={formData.deliveryFees}
                      onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      rows={3}
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <Button onClick={handleCreateDeclaration} className="flex-1">
                      Enregistrer
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
                      Annuler
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* My Declarations Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Résumé de mes Déclarations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 bg-yellow-50 rounded-lg">
                  <div className="text-2xl font-bold text-yellow-700">
                    {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                  </div>
                  <div className="text-sm text-yellow-600">En Attente</div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="text-2xl font-bold text-green-700">
                    {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                  </div>
                  <div className="text-sm text-green-600">Validées</div>
                </div>
                <div className="p-4 bg-red-50 rounded-lg">
                  <div className="text-2xl font-bold text-red-700">
                    {chauffeurDeclarations.filter(d => d.status === 'refuse').length}
                  </div>
                  <div className="text-sm text-red-600">Refusées</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Declarations List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Mes Déclarations ({chauffeurDeclarations.length})
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
                searchPlaceholder="Rechercher par numéro, notes..."
                filterPlaceholder="Filtrer par statut"
              />

              {filteredDeclarations.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  {searchTerm || statusFilter !== 'all' 
                    ? 'Aucune déclaration trouvée avec ces critères'
                    : 'Aucune déclaration trouvée'
                  }
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Numéro</TableHead>
                      <TableHead>Distance</TableHead>
                      <TableHead>Frais</TableHead>
                      <TableHead>Statut</TableHead>
                      <TableHead>Date création</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredDeclarations.map((declaration) => (
                      <TableRow key={declaration.id}>
                        <TableCell className="font-medium">
                          {declaration.number}
                        </TableCell>
                        <TableCell>
                          {declaration.distance ? `${declaration.distance} km` : '-'}
                        </TableCell>
                        <TableCell>
                          {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                        </TableCell>
                        <TableCell>
                          {getStatusBadge(declaration.status)}
                        </TableCell>
                        <TableCell>
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
                                  className="text-red-600 hover:text-red-800"
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
            </div>
          </CardContent>
        </Card>

        <Separator />

        {/* Interactive Map section */}
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
