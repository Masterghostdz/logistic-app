import React, { useState, useMemo, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Warehouse } from '../../types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';
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
  // Synchronisation temps réel des entrepôts depuis Firestore
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenWarehouses } = await import('../../services/warehouseService');
      unsubscribe = listenWarehouses((cloudWarehouses) => {
        setWarehouses(cloudWarehouses);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  // Firestore connection status
  const [isOnline, setIsOnline] = useState(true);
  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkConnection = async () => {
      try {
        const { getFirestore, collection, getDocs } = await import('firebase/firestore');
        const { db } = await import('../../services/firebaseClient');
        // On tente de lire une collection pour vérifier la connexion
        await getDocs(collection(db, 'chauffeurs'));
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();
    interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  // Synchronisation temps réel des déclarations depuis Firestore
  const [declarations, setDeclarations] = useState<Declaration[]>([]);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenDeclarations } = await import('../../services/declarationService');
      unsubscribe = listenDeclarations((cloudDeclarations) => {
        setDeclarations(cloudDeclarations);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const [activeTab, setActiveTab] = useState('dashboard');

  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);

  // Synchronisation temps réel des chauffeurs depuis Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenChauffeurs } = await import('../../services/chauffeurService');
      unsubscribe = listenChauffeurs((cloudChauffeurs) => {
        setChauffeurs(cloudChauffeurs);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [showCreateChauffeur, setShowCreateChauffeur] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  // Export dialog state
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  // Attributs sélectionnés pour l'export
  const [exportAttributes, setExportAttributes] = useState<string[]>([]);
  // Format d'export (csv ou excel)
  const [exportFormat, setExportFormat] = useState<'csv' | 'excel'>('csv');
  // Lignes sélectionnées pour l'export
  const [selectedDeclarationIds, setSelectedDeclarationIds] = useState<string[]>([]);
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
      // Modification d'un chauffeur existant (Firestore)
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
      const { updateChauffeur } = await import('../../services/chauffeurService');
      await updateChauffeur(editingChauffeur.id, updatedChauffeur);
      setEditingChauffeur(null);
      toast.success('Chauffeur modifié avec succès');
    } else {
      // Création d'un nouveau chauffeur (Firestore)
      const chauffeur: Omit<Chauffeur, 'id'> = {
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
      const { addChauffeur, updateChauffeur } = await import('../../services/chauffeurService');
      const docRef = await addChauffeur(chauffeur);
      // Ajoute l'id Firestore dans le document pour cohérence
      await updateChauffeur(docRef.id, { id: docRef.id });
      // Ajout dans la collection users pour l'authentification
      const { addUser } = await import('../../services/userService');
      // Génération salt et hash du mot de passe
      const salt = Math.random().toString(36).substring(2, 15);
      const passwordHash = await (await import('../../utils/authUtils')).simpleHash(newChauffeur.password, salt);
      await addUser({
        username: newChauffeur.username,
        salt,
        passwordHash,
        role: 'chauffeur',
        firstName,
        lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.fullName}`,
        phone: newChauffeur.phone,
        vehicleType: newChauffeur.vehicleType,
        employeeType: newChauffeur.employeeType,
        isActive: true,
        createdAt: new Date().toISOString()
      });
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

  const handleValidateDeclaration = async (id: string) => {
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const updatedDeclaration = {
        ...declaration,
        status: 'valide' as const,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur'
      };
      const { updateDeclaration } = await import('../../services/declarationService');
      await updateDeclaration(id, updatedDeclaration);
      toast.success('Déclaration validée');
    }
  };

  const handleRejectDeclaration = async (id: string) => {
    const declaration = declarations.find(d => d.id === id);
    if (declaration) {
      const updatedDeclaration = {
        ...declaration,
        status: 'refuse' as const,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur'
      };
      const { updateDeclaration } = await import('../../services/declarationService');
      await updateDeclaration(id, updatedDeclaration);
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

  const handleUpdateDeclaration = async (updatedDeclaration: Declaration) => {
    const { updateDeclaration } = await import('../../services/declarationService');
    await updateDeclaration(updatedDeclaration.id, updatedDeclaration);
    setEditingDeclaration(null);
    toast.success('Déclaration mise à jour');
  };

  const handleDeleteDeclaration = async (id: string) => {
    const { deleteDeclaration } = await import('../../services/declarationService');
    await deleteDeclaration(id);
    toast.success('Déclaration supprimée');
  };

  const [chauffeurToDelete, setChauffeurToDelete] = useState<string | null>(null);
  const handleDeleteChauffeur = (id: string) => {
    setChauffeurToDelete(id);
  };
  const confirmDeleteChauffeur = async () => {
    if (!chauffeurToDelete) return;
    try {
      const { deleteChauffeur } = await import('../../services/chauffeurService');
      const { getUsers, deleteUser } = await import('../../services/userService');
      const chauffeur = chauffeurs.find(c => c.id === chauffeurToDelete);
      let chauffeurDeleted = false;
      let userDeleted = false;
      if (chauffeur) {
        await deleteChauffeur(chauffeurToDelete);
        chauffeurDeleted = true;
        const users = await getUsers();
        const user = users.find(u => u.username === chauffeur.username);
        if (user) {
          await deleteUser(user.id);
          userDeleted = true;
        }
      }
      if (chauffeurDeleted && userDeleted) {
        toast.success('Chauffeur et utilisateur supprimés');
      } else if (chauffeurDeleted) {
        toast.success('Chauffeur supprimé (utilisateur non trouvé)');
      } else {
        toast.error('Erreur lors de la suppression du chauffeur');
      }
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
    setChauffeurToDelete(null);
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

  // Fonction d'exportation CSV
  const exportToCSV = (data: any[], columns: string[], filename: string) => {
    const csvRows = [];
    csvRows.push(columns.join(','));
    for (const row of data) {
      const values = columns.map(col => {
        let v = row[col];
        if (typeof v === 'string') {
          v = v.replace(/"/g, '""');
          if (v.includes(',') || v.includes('\n')) v = `"${v}"`;
        }
        return v ?? '';
      });
      csvRows.push(values.join(','));
    }
    const csvString = csvRows.join('\n');
    const blob = new Blob([csvString], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Fonction d'exportation Excel
  const exportToExcel = (data: any[], columns: string[], filename: string) => {
    const exportData = data.map(row => {
      const obj: any = {};
      columns.forEach(col => {
        obj[col] = row[col];
      });
      return obj;
    });
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Déclarations');
    XLSX.writeFile(wb, filename);
  };

  // Déclarations à exporter selon sélection
  const declarationsToExport = selectedDeclarationIds.length > 0
    ? filteredDeclarations.filter(d => selectedDeclarationIds.includes(d.id))
    : filteredDeclarations;

  return (
    <div>
      <Header onProfileClick={handleProfileClick} />
      <div className="flex justify-end items-center px-6 pt-2">
        <span className={`text-xs font-semibold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>Système {isOnline ? 'en ligne' : 'hors ligne'}</span>
      </div>
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
                {/* Bouton Exporter à gauche */}
                <div className="flex items-center gap-2">
                  <Button 
                    variant="outline" 
                    onClick={() => setExportDialogOpen(true)}
                    disabled={selectedDeclarationIds.length === 0}
                  >
                    Exporter
                  </Button>
                </div>
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

              {/* TODO: Passer selectedDeclarationIds et setSelectedDeclarationIds à DeclarationsTable pour la sélection des lignes */}
              <DeclarationsTable
                declarations={filteredDeclarations}
                onValidateDeclaration={handleValidateDeclaration}
                onRejectDeclaration={handleRejectDeclaration}
                onEditDeclaration={handleEditDeclaration}
                onDeleteDeclaration={handleDeleteDeclaration}
                selectedDeclarationIds={selectedDeclarationIds}
                setSelectedDeclarationIds={setSelectedDeclarationIds}
              />

              {/* Dialog d'exportation */}
              <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                <AlertDialogContent style={{ zIndex: 10000, position: 'fixed', maxWidth: 480 }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Exporter les déclarations</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div className="space-y-4">
                    <div>
                      <div className="font-semibold mb-1">Attributs à exporter :</div>
                      {/* TODO: Générer dynamiquement la liste des attributs de déclaration */}
                      <div className="flex flex-wrap gap-2">
                        {['number','chauffeurName','status','month','year','createdAt','validatedAt','validatedBy'].map(attr => (
                          <label key={attr} className="flex items-center gap-1">
                            <input
                              type="checkbox"
                              checked={exportAttributes.includes(attr)}
                              onChange={e => {
                                setExportAttributes(prev => e.target.checked ? [...prev, attr] : prev.filter(a => a !== attr));
                              }}
                            />
                            <span>{attr}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Format :</div>
                      <label className="mr-4">
                        <input
                          type="radio"
                          name="exportFormat"
                          value="csv"
                          checked={exportFormat === 'csv'}
                          onChange={() => setExportFormat('csv')}
                        /> CSV
                      </label>
                      <label>
                        <input
                          type="radio"
                          name="exportFormat"
                          value="excel"
                          checked={exportFormat === 'excel'}
                          onChange={() => setExportFormat('excel')}
                        /> Excel
                      </label>
                    </div>
                    <div>
                      <div className="font-semibold mb-1">Lignes à exporter :</div>
                      <div>
                        <label className="mr-4">
                          <input
                            type="radio"
                            name="exportRows"
                            value="filtered"
                            checked={selectedDeclarationIds.length === 0}
                            onChange={() => setSelectedDeclarationIds([])}
                          />
                          Toutes les lignes filtrées ({filteredDeclarations.length})
                        </label>
                        <label>
                          <input
                            type="radio"
                            name="exportRows"
                            value="selected"
                            checked={selectedDeclarationIds.length > 0}
                            onChange={() => {}}
                          />
                          Lignes sélectionnées ({selectedDeclarationIds.length})
                        </label>
                      </div>
                    </div>
                  </div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setExportDialogOpen(false)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        if (exportAttributes.length === 0 || selectedDeclarationIds.length === 0) return;
                        if (exportFormat === 'csv') {
                          exportToCSV(declarationsToExport, exportAttributes, 'declarations.csv');
                        } else {
                          exportToExcel(declarationsToExport, exportAttributes, 'declarations.xlsx');
                        }
                        setExportDialogOpen(false);
                        toast.success('Exportation terminée');
                      }}
                      disabled={exportAttributes.length === 0 || selectedDeclarationIds.length === 0}
                    >
                      Exporter
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
              {/* Confirmation dialog for chauffeur deletion */}
              <AlertDialog open={!!chauffeurToDelete} onOpenChange={open => { if (!open) setChauffeurToDelete(null); }}>
                <AlertDialogContent style={{ zIndex: 10000, position: 'fixed' }}>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                  </AlertDialogHeader>
                  <div>Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.</div>
                  <AlertDialogFooter>
                    <AlertDialogCancel onClick={() => setChauffeurToDelete(null)}>Annuler</AlertDialogCancel>
                    <AlertDialogAction onClick={confirmDeleteChauffeur}>Supprimer</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
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
