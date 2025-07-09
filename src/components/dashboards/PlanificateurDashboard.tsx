import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Declaration, Chauffeur } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import SearchAndFilter from '../SearchAndFilter';
import ProfilePage from '../ProfilePage';
import TracageSection from '../TracageSection';
import Header from '../Header';
import EditDeclarationDialog from '../EditDeclarationDialog';
import PlanificateurStats from './PlanificateurStats';
import PlanificateurSidebar from './PlanificateurSidebar';
import DeclarationsTable from './DeclarationsTable';
import ChauffeursTable from './ChauffeursTable';
import CreateChauffeurDialog from './CreateChauffeurDialog';

const PlanificateurDashboard = () => {
  const { declarations, updateDeclaration, deleteDeclaration } = useSharedData();
  const [activeTab, setActiveTab] = useState('dashboard');

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
    fullName: '',
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

  const handleCreateChauffeur = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newChauffeur.fullName || !newChauffeur.username || !newChauffeur.password) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    // Parse fullName to firstName and lastName
    const nameParts = newChauffeur.fullName.trim().split(' ');
    const firstName = nameParts[0] || '';
    const lastName = nameParts.slice(1).join(' ') || '';

    if (editingChauffeur) {
      // Modification d'un chauffeur existant
      const updatedChauffeur: Chauffeur = {
        ...editingChauffeur,
        firstName,
        lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.fullName}`,
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
        firstName,
        lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.fullName}`,
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
      fullName: '',
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
      fullName: `${chauffeur.firstName} ${chauffeur.lastName}`,
      username: chauffeur.username,
      password: chauffeur.password,
      phone: chauffeur.phone,
      vehicleType: chauffeur.vehicleType,
      employeeType: chauffeur.employeeType
    });
    setShowCreateChauffeur(true);
  };

  const handleValidateDeclaration = (id: string) => {
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const updatedDeclaration = {
        ...declaration,
        status: 'valide' as const,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur'
      };
      updateDeclaration(id, updatedDeclaration);
      toast.success('Déclaration validée');
    }
  };

  const handleRejectDeclaration = (id: string) => {
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const updatedDeclaration = {
        ...declaration,
        status: 'refuse' as const,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur'
      };
      updateDeclaration(id, updatedDeclaration);
      toast.success('Déclaration refusée');
    }
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
    updateDeclaration(updatedDeclaration.id, updatedDeclaration);
    setEditingDeclaration(null);
    toast.success('Déclaration mise à jour');
  };

  const handleDeleteDeclaration = (id: string) => {
    deleteDeclaration(id);
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
        <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} />

        <div className="flex-1 p-6 overflow-auto">
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold">Tableau de bord - Planificateur</h1>
              </div>

              <PlanificateurStats stats={stats} onEnAttenteClick={handleEnAttenteClick} />

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
                          {/* Status badge logic moved to DeclarationsTable */}
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

              <DeclarationsTable
                declarations={filteredDeclarations}
                onValidateDeclaration={handleValidateDeclaration}
                onRejectDeclaration={handleRejectDeclaration}
                onEditDeclaration={handleEditDeclaration}
                onDeleteDeclaration={handleDeleteDeclaration}
              />
            </div>
          )}

          {activeTab === 'chauffeurs' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Chauffeurs</h2>
                <Button 
                  className="flex items-center gap-2"
                  onClick={() => setShowCreateChauffeur(true)}
                >
                  <Plus className="h-4 w-4" />
                  Ajouter un chauffeur
                </Button>
              </div>

              <ChauffeursTable
                chauffeurs={chauffeurs}
                onEditChauffeur={handleEditChauffeur}
                onDeleteChauffeur={handleDeleteChauffeur}
              />
            </div>
          )}
        </div>
      </div>

      <CreateChauffeurDialog
        isOpen={showCreateChauffeur}
        onClose={() => {
          setShowCreateChauffeur(false);
          setEditingChauffeur(null);
        }}
        onSubmit={handleCreateChauffeur}
        editingChauffeur={editingChauffeur}
        newChauffeur={newChauffeur}
        setNewChauffeur={setNewChauffeur}
      />

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
