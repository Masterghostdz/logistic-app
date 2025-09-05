import React, { useState, useMemo, useEffect } from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Monitor, Smartphone } from 'lucide-react';
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import * as XLSX from 'xlsx';
import { Warehouse } from '../../types';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction, AlertDialogDescription } from '../ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Textarea } from '../ui/textarea';
import PhoneNumbersField from '../PhoneNumbersField';
import { toast } from 'sonner';
import { Plus } from 'lucide-react';
import { Declaration, Chauffeur } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import SearchAndFilter from '../SearchAndFilter';
import ProfilePage from '../ProfilePage';
import TracageSection from '../TracageSection';
import WarehouseTable from './WarehouseTable';
import Header from '../Header';
import EditDeclarationDialog from '../EditDeclarationDialog';
import PlanificateurStats from './PlanificateurStats';
import PlanificateurSidebar from './PlanificateurSidebar';
import DeclarationsTable from './DeclarationsTable';
import ChauffeursTable from './ChauffeursTable';
import CreateChauffeurDialog from './CreateChauffeurDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';

const PlanificateurDashboard = () => {
  const { companies } = useSharedData();
  // Consultation (read-only) and modification (edit) states
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  // Utilise le mode d'affichage global depuis les settings
  const { settings, updateSettings } = useSettings();
  // Le style est sélectionné selon le paramètre settings.viewMode
  const viewMode = settings.viewMode || 'desktop';
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
  // Online status global
  // Fonction pour refuser une déclaration
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
  const { isOnline } = useOnlineStatus();

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
        // Correction du mapping pour garantir la structure et les valeurs par défaut
        const mappedChauffeurs = cloudChauffeurs.map((c: any) => ({
          id: c.id,
          firstName: c.firstName || '',
          lastName: c.lastName || '',
          fullName: c.fullName || '',
          username: c.username || '',
          password: c.password || '',
          phone: Array.isArray(c.phone) ? c.phone : (c.phone ? [c.phone] : []),
          vehicleType: c.vehicleType || '',
          employeeType: (c.employeeType === 'externe' ? 'externe' : 'interne') as 'interne' | 'externe',
          isActive: typeof c.isActive === 'boolean' ? c.isActive : true,
          createdAt: c.createdAt || '',
        }));
        setChauffeurs(mappedChauffeurs);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [searchValue, setSearchValue] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchColumn, setSearchColumn] = useState<'number' | 'chauffeurName'>('number');
  const [tableFontSize, setTableFontSize] = useState<'40' | '50' | '60' | '70' | '80' | '90' | '100'>(settings.tableFontSize || '80');
  const [showCreateChauffeur, setShowCreateChauffeur] = useState(false);
  const [consultingDeclaration, setConsultingDeclaration] = useState<Declaration | null>(null);
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
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    companyId: '',
    companyName: '',
    phone: [],
    address: '',
    status: 'active',
    lat: '',
    lng: '',
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name || !newWarehouse.companyId || !newWarehouse.companyName || !newWarehouse.address) return;
    const warehouse = {
      name: newWarehouse.name,
      companyId: newWarehouse.companyId,
      companyName: newWarehouse.companyName,
      phone: newWarehouse.phone,
      address: newWarehouse.address,
      isActive: newWarehouse.status === 'active',
      createdAt: new Date().toISOString(),
      coordinates: {
        lat: parseFloat(newWarehouse.lat),
        lng: parseFloat(newWarehouse.lng)
      },
    };
    import('../../services/warehouseService').then(mod => {
      mod.addWarehouse(warehouse).then(() => {
  setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', status: 'active', lat: '', lng: '' });
        setShowCreateWarehouse(false);
      });
    });
  };

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
      // Ajout dans la collection users pour l'authentification (en premier)
      const { addUser } = await import('../../services/userService');
      const salt = Math.random().toString(36).substring(2, 15);
      const passwordHash = await (await import('../../utils/authUtils')).simpleHash(newChauffeur.password, salt);
      const userDoc = await addUser({
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
      // Ajout dans la collection chauffeurs avec le même ID que dans users
      const { setDoc, doc: firestoreDoc } = await import('firebase/firestore');
      const { db } = await import('../../services/firebaseClient');
      await setDoc(firestoreDoc(db, 'chauffeurs', userDoc.id), {
        id: userDoc.id,
        firstName,
        lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.fullName}`,
        username: newChauffeur.username,
        password: passwordHash,
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
    if (viewMode === 'desktop') {
      return (
        <div className="bg-background min-h-screen flex flex-col">
          <Header onProfileClick={handleProfileClick} />
          <div className="flex h-[calc(100vh-4rem)] relative">
            {/* Badge en ligne en haut à droite, desktop uniquement */}
            <span
              className="absolute top-0 right-0 m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
              title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </span>
            <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} />
            <div className="flex-1 p-6 pt-16">
              <TracageSection />
            </div>
          </div>
        </div>
      );
    } else {
      return (
        <div className="max-w-[430px] mx-auto bg-background min-h-screen flex flex-col">
          <Header onProfileClick={handleProfileClick} />
          {/* Badge en ligne mobile : juste sous le header */}
          <div className="flex px-2 pt-3 mb-2">
            <span
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
              title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </span>
          </div>
          <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="p-6">
            {/* Carte (map) en premier */}
            <TracageSection />
          </div>
        </div>
      );
    }
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
    <div className={viewMode === 'mobile' ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'bg-background min-h-screen flex flex-col'}>
      <Header onProfileClick={handleProfileClick} />
      {/* Badge en ligne : mobile sous le header, desktop à droite de la sidebar, sous le header */}
      {viewMode === 'mobile' ? (
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
      <div className={viewMode === 'mobile' ? 'flex flex-col h-auto gap-2' : 'flex flex-row h-[calc(100vh-4rem)] relative'}>
        <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="relative flex-1">
          {/* Badge En ligne en haut à droite du bloc content, sous le header, à l'intérieur mais hors de la sidebar (desktop uniquement) */}
          {viewMode !== 'mobile' && (
            <span
              className="absolute top-0 right-0 m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
              title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </span>
          )}
          <div className="p-6 pt-16 overflow-auto">
            {/* ...existing code for tabs and content... */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-foreground text-left">Tableau de bord - Planificateur</h1>
                </div>
                {/* Toujours aligné à gauche pour En Attente, Déclarations récentes prend toute la largeur */}
                <div className="w-full max-w-xl">
                  <PlanificateurStats stats={stats} onEnAttenteClick={handleEnAttenteClick} />
                </div>
                <Card className="w-full">
                  <CardHeader>
                    <CardTitle>Déclarations récentes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {declarations.slice(0, 5).map((declaration) => (
                        <div key={declaration.id} className="flex items-center justify-between p-3 border rounded-lg cursor-pointer hover:bg-accent" onClick={() => setConsultingDeclaration(declaration)}>
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
                {/* Titre au-dessus de la barre de recherche */}
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Gestion des Déclarations</h2>
                </div>
                <SearchAndFilter
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={[{ value: 'en_cours', label: 'En Attente' }, { value: 'valide', label: 'Validé' }, { value: 'refuse', label: 'Refusé' }]}
                  searchPlaceholder="Rechercher par numéro ou chauffeur..."
                  filterPlaceholder="Filtrer par état..."
                  searchColumn={searchColumn}
                  onSearchColumnChange={value => setSearchColumn(value as 'number' | 'chauffeurName')}
                  searchColumnOptions={[
                    { value: 'number', label: 'Numéro' },
                    { value: 'chauffeurName', label: 'Chauffeur' }
                  ]}
                />
                {/* Table responsive pour mobile, zoom intégré dans le CardHeader */}
                <div className={(viewMode === 'mobile' ? 'overflow-x-auto ' : '') + 'mb-2'}>
                  <Card>
                    <CardContent className="p-0">
                      <DeclarationsTable
                        declarations={filteredDeclarations}
                        onValidateDeclaration={handleValidateDeclaration}
                        onRejectDeclaration={handleRejectDeclaration}
                        onEditDeclaration={setEditingDeclaration}
                        onDeleteDeclaration={handleDeleteDeclaration}
                        selectedDeclarationIds={selectedDeclarationIds}
                        setSelectedDeclarationIds={setSelectedDeclarationIds}
                        mobile={viewMode === 'mobile'}
                        fontSize={tableFontSize as '40' | '60' | '80' | '100'}
                        onConsultDeclaration={setConsultingDeclaration}
                      />
                    </CardContent>
                  </Card>
                </div>
                <AlertDialog open={exportDialogOpen} onOpenChange={setExportDialogOpen}>
                  <AlertDialogContent style={{ zIndex: 10000, position: 'fixed', maxWidth: 480 }}>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Exporter les déclarations</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription id="export-dialog-desc">
                      Sélectionnez les attributs et le format pour exporter les déclarations.
                    </AlertDialogDescription>
                    <div className="space-y-4">
                      {/* ...existing code... */}
                    </div>
                    <AlertDialogFooter>
                      {/* ...existing code... */}
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {activeTab === 'entrepots' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Gestion des Entrepôts</h2>
                  <Dialog open={showCreateWarehouse} onOpenChange={setShowCreateWarehouse}>
                    <DialogTrigger asChild>
                      <Button className="flex items-center gap-2" onClick={() => setShowCreateWarehouse(true)}>
                        <Plus className="h-4 w-4" />
                        Ajouter
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Créer un nouvel entrepôt</DialogTitle>
                      </DialogHeader>
                      <form onSubmit={handleCreateWarehouse} className="space-y-4">
                        <div>
                          <Label htmlFor="warehouseName">Nom de l'entrepôt *</Label>
                          <Input
                            id="warehouseName"
                            value={newWarehouse.name}
                            onChange={e => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="companyId">Société *</Label>
                          <Select
                            value={newWarehouse.companyId || ''}
                            onValueChange={value => {
                              const selected = companies.find(c => c.id === value);
                              setNewWarehouse({ ...newWarehouse, companyId: value, companyName: selected ? selected.name : '' });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner une société" />
                            </SelectTrigger>
                            <SelectContent>
                              {companies.map(company => (
                                <SelectItem key={company.id} value={company.id}>{company.name}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <PhoneNumbersField
                            phones={newWarehouse.phone}
                            onChange={phones => setNewWarehouse({ ...newWarehouse, phone: phones })}
                            label="Numéros de téléphone"
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouseStatus">Statut *</Label>
                          <Select
                            value={newWarehouse.status || 'active'}
                            onValueChange={value => setNewWarehouse({ ...newWarehouse, status: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionner le statut" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="active">Actif</SelectItem>
                              <SelectItem value="inactive">Inactif</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label htmlFor="warehouseAddress">Adresse *</Label>
                          <Textarea
                            id="warehouseAddress"
                            value={newWarehouse.address}
                            onChange={e => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                            rows={3}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouseLat">Latitude *</Label>
                          <Input
                            id="warehouseLat"
                            type="number"
                            step="any"
                            value={newWarehouse.lat}
                            onChange={e => setNewWarehouse({ ...newWarehouse, lat: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="warehouseLng">Longitude *</Label>
                          <Input
                            id="warehouseLng"
                            type="number"
                            step="any"
                            value={newWarehouse.lng}
                            onChange={e => setNewWarehouse({ ...newWarehouse, lng: e.target.value })}
                            required
                          />
                        </div>
                        <div className="flex gap-2 pt-4">
                          <Button type="submit" className="flex-1">Créer</Button>
                          <Button type="button" variant="outline" onClick={() => setShowCreateWarehouse(false)}>
                            Annuler
                          </Button>
                        </div>
                      </form>
                    </DialogContent>
                  </Dialog>
                </div>
                {/* Barre de recherche/filtre pour entrepôts hors du Card/table */}
                <SearchAndFilter
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={[{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }]}
                  searchPlaceholder="Rechercher par nom ou ville..."
                  filterPlaceholder="Filtrer..."
                  searchColumn={searchColumn}
                  onSearchColumnChange={value => setSearchColumn(value as 'number' | 'chauffeurName')}
                  searchColumnOptions={[
                    { value: 'number', label: 'Numéro' },
                    { value: 'warehouseName', label: 'Entrepôt' }
                  ]}
                />
                <div className={(viewMode === 'mobile' ? 'overflow-x-auto ' : '') + 'mb-2'}>
                  <Card>
                    <CardContent className="p-0">
                      <WarehouseTable
                        warehouses={warehouses}
                        onCreate={() => {/* TODO: ouvrir modal de création d'entrepôt */}}
                        onEdit={wh => {/* TODO: ouvrir modal d'édition */}}
                        onDelete={wh => {/* TODO: ouvrir confirmation suppression */}}
                        onConsult={wh => {/* TODO: ouvrir consultation */}}
                        fontSize={tableFontSize as '40' | '50' | '60' | '70' | '80' | '90' | '100'}
                      />
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}
            {activeTab === 'chauffeurs' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Gestion des Chauffeurs</h2>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setShowCreateChauffeur(true)}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                {/* Barre de recherche/filtre pour chauffeurs */}
                <SearchAndFilter
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={[{ value: 'actif', label: 'Actif' }, { value: 'inactif', label: 'Inactif' }]}
                  searchPlaceholder="Rechercher par nom ou téléphone..."
                  filterPlaceholder="Filtrer..."
                  searchColumn={searchColumn}
                  onSearchColumnChange={value => setSearchColumn(value as 'number' | 'chauffeurName')}
                  searchColumnOptions={[
                    { value: 'number', label: 'Numéro' },
                    { value: 'chauffeurName', label: 'Chauffeur' }
                  ]}
                />
                <ChauffeursTable
                  chauffeurs={chauffeurs}
                  onEditChauffeur={handleEditChauffeur}
                  onDeleteChauffeur={handleDeleteChauffeur}
                  fontSize={tableFontSize as '40' | '50' | '60' | '70' | '80' | '90' | '100'}
                />
                <AlertDialog open={!!chauffeurToDelete} onOpenChange={open => { if (!open) setChauffeurToDelete(null); }}>
                  <AlertDialogContent style={{ zIndex: 10000, position: 'fixed' }} aria-describedby="delete-chauffeur-desc">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription id="delete-chauffeur-desc">
                      Êtes-vous sûr de vouloir supprimer ce chauffeur ? Cette action est irréversible.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setChauffeurToDelete(null)}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeleteChauffeur}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {/* ...dialogs and modals... */}
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
            {consultingDeclaration ? (
              <EditDeclarationDialog
                declaration={consultingDeclaration}
                isOpen={!!consultingDeclaration}
                onClose={() => setConsultingDeclaration(null)}
                readOnly={true}
                onSave={() => {}}
              />
            ) : null}
            {editingDeclaration && !consultingDeclaration ? (
              <EditDeclarationDialog
                declaration={editingDeclaration}
                isOpen={!!editingDeclaration}
                onClose={() => setEditingDeclaration(null)}
                onSave={handleUpdateDeclaration}
              />
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanificateurDashboard;
