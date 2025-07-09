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
import { MapPin, Plus, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Declaration } from '../../types';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import OpenStreetMap from '../OpenStreetMap';
import TracageSection from '../TracageSection';
import Header from '../Header';

const ChauffeurDashboard = () => {
  const { user } = useAuth();
  const { declarations, addDeclaration } = useSharedData();
  
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

  useEffect(() => {
    if (user) {
      // Fetch declarations or perform other initialization logic here
    }
  }, [user]);

  const [showAllDeclarations, setShowAllDeclarations] = useState(false);

  const toggleDeclarationsView = () => {
    setShowAllDeclarations(!showAllDeclarations);
  };

  const allDeclarations = declarations.filter(
    declaration => declaration.chauffeurId === user?.id
  );

  const pendingDeclarations = allDeclarations.filter(
    declaration => declaration.status === 'en_cours'
  );

  const validatedDeclarations = allDeclarations.filter(
    declaration => declaration.status === 'valide'
  );

  const rejectedDeclarations = allDeclarations.filter(
    declaration => declaration.status === 'refuse'
  );

  const chauffeurDeclarations = declarations.filter(
    declaration => declaration.chauffeurId === user?.id
  );

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
        <div className="flex items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-900">
            Tableau de bord - Chauffeur
          </h1>
          <Badge variant="secondary" className="text-sm">
            {user?.fullName}
          </Badge>
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

          {/* My Declarations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Mes Déclarations ({chauffeurDeclarations.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {chauffeurDeclarations.length === 0 ? (
                  <p className="text-gray-500 text-center py-4">
                    Aucune déclaration trouvée
                  </p>
                ) : (
                  chauffeurDeclarations.map((declaration) => (
                    <div key={declaration.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium text-sm">
                          {declaration.number}
                        </span>
                        {getStatusBadge(declaration.status)}
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        {declaration.distance && (
                          <div>Distance: {declaration.distance} km</div>
                        )}
                        {declaration.deliveryFees && (
                          <div>Frais: {declaration.deliveryFees} DZD</div>
                        )}
                        {declaration.notes && (
                          <div>Notes: {declaration.notes}</div>
                        )}
                        <div>
                          Créé le: {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator />

        {/* Map and Tracking sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Carte Interactive
              </CardTitle>
            </CardHeader>
            <CardContent>
              <OpenStreetMap />
            </CardContent>
          </Card>

          <TracageSection />
        </div>
      </div>
    </div>
  );
};

export default ChauffeurDashboard;
