import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Declaration } from '../../types';
import { Plus, FileText, MapPin, Camera, Edit, Trash2, Clock, CheckCircle, XCircle } from 'lucide-react';
import { toast } from 'sonner';

const ChauffeurDashboard = () => {
  const { user } = useAuth();
  const { t } = useTranslation();
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  const [showNewDeclaration, setShowNewDeclaration] = useState(false);
  const [formData, setFormData] = useState({
    programNumber: '',
    year: new Date().getFullYear().toString().slice(-2),
    month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
    distance: '',
    deliveryFees: '',
    notes: '',
    photos: [] as string[]
  });

  useEffect(() => {
    // Charger les déclarations du chauffeur depuis localStorage
    const savedDeclarations = localStorage.getItem(`declarations_${user?.id}`);
    if (savedDeclarations) {
      setDeclarations(JSON.parse(savedDeclarations));
    }
  }, [user?.id]);

  const generateDeclarationNumber = (programNumber: string, year: string, month: string) => {
    return `DCP/${year}/${month}/${programNumber}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newDeclaration: Declaration = {
      id: Date.now().toString(),
      number: generateDeclarationNumber(formData.programNumber, formData.year, formData.month),
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
    
    // Réinitialiser le formulaire
    setFormData({
      programNumber: '',
      year: new Date().getFullYear().toString().slice(-2),
      month: (new Date().getMonth() + 1).toString().padStart(2, '0'),
      distance: '',
      deliveryFees: '',
      notes: '',
      photos: []
    });
    
    setShowNewDeclaration(false);
    toast.success(t('forms.success'));
  };

  const handleDelete = (id: string) => {
    const updatedDeclarations = declarations.filter(d => d.id !== id);
    setDeclarations(updatedDeclarations);
    localStorage.setItem(`declarations_${user?.id}`, JSON.stringify(updatedDeclarations));
    toast.success(t('forms.success'));
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
        return <Badge className="bg-orange-100 text-orange-800">{t('declarations.pending')}</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800">{t('declarations.validated')}</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800">{t('declarations.refused')}</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
    }
  };

  const stats = {
    total: declarations.length,
    pending: declarations.filter(d => d.status === 'en_cours').length,
    validated: declarations.filter(d => d.status === 'valide').length,
    refused: declarations.filter(d => d.status === 'refuse').length
  };

  return (
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
              {t('declarations.new')}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>{t('declarations.new')}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="year">Année</Label>
                  <select
                    id="year"
                    value={formData.year}
                    onChange={(e) => setFormData({...formData, year: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    <option value="24">24</option>
                    <option value="25">25</option>
                    <option value="26">26</option>
                    <option value="27">27</option>
                    <option value="28">28</option>
                  </select>
                </div>
                <div>
                  <Label htmlFor="month">Mois</Label>
                  <select
                    id="month"
                    value={formData.month}
                    onChange={(e) => setFormData({...formData, month: e.target.value})}
                    className="w-full p-2 border rounded"
                    required
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <option key={i + 1} value={(i + 1).toString().padStart(2, '0')}>
                        {(i + 1).toString().padStart(2, '0')}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label htmlFor="programNumber">Programme</Label>
                  <Input
                    id="programNumber"
                    value={formData.programNumber}
                    onChange={(e) => setFormData({...formData, programNumber: e.target.value})}
                    placeholder="XXXX"
                    maxLength={4}
                    required
                  />
                </div>
              </div>
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
                  <Label htmlFor="deliveryFees">{t('declarations.deliveryFees')}</Label>
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
                <Button type="button" variant="outline" onClick={() => setShowNewDeclaration(false)}>
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
              {t('dashboard.totalDeclarations')}
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
              {t('declarations.pending')}
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
              {t('declarations.validated')}
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
              {t('declarations.refused')}
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
          <CardTitle>{t('declarations.title')}</CardTitle>
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
            <div className="space-y-4">
              {declarations.map((declaration) => (
                <div key={declaration.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-4">
                    {getStatusIcon(declaration.status)}
                    <div>
                      <div className="font-medium">{declaration.number}</div>
                      <div className="text-sm text-gray-500">
                        {new Date(declaration.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-sm">
                      {declaration.distance && (
                        <span className="text-gray-600">
                          {declaration.distance} km
                        </span>
                      )}
                      {declaration.deliveryFees && (
                        <span className="text-gray-600 ml-2">
                          {declaration.deliveryFees} FCFA
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStatusBadge(declaration.status)}
                    {declaration.status === 'en_cours' && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(declaration.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Carte des entrepôts */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            {t('warehouses.map')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
            <div className="text-center text-gray-500">
              <MapPin className="h-12 w-12 mx-auto mb-2" />
              <p>Carte interactive des entrepôts</p>
              <p className="text-sm">Fonctionnalité à venir</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ChauffeurDashboard;
