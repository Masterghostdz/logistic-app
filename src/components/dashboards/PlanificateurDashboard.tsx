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
import { doc, updateDoc } from 'firebase/firestore';
import { db as firestore } from '../../services/firebaseClient';
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
import RefusalReasonDialog from '../RefusalReasonDialog';
import ChauffeursTable from './ChauffeursTable';
import CreateChauffeurDialog from './CreateChauffeurDialog';
import ClientsTable from './ClientsTable';
import ClientDialog from './ClientDialog';
import ClientMapDialog from './ClientMapDialog';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { useAuth } from '../../contexts/AuthContext';
import { useTranslation } from '../../hooks/useTranslation';

const PlanificateurDashboard = () => {
  // Heartbeat Firestore: met à jour lastOnline toutes les 60s
  const auth = useAuth();
  useEffect(() => {
    if (!auth?.user?.id) return;
    const userRef = doc(firestore, 'users', auth.user.id);
    const interval = setInterval(() => {
      updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
    }, 60000);
    updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
    return () => clearInterval(interval);
  }, [auth?.user?.id]);
  const [consultMode, setConsultMode] = useState(false);
  const { user } = useAuth();
  const { t } = useTranslation();
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
  // Refusal reason dialog state
  const [refusalDialogOpen, setRefusalDialogOpen] = useState(false);
  const [refusalDeclarationId, setRefusalDeclarationId] = useState<string | null>(null);
  const [pendingRefusalReason, setPendingRefusalReason] = useState<any>(null);

  // Open dialog when rejecting
  const handleRejectDeclaration = (id: string) => {
    setRefusalDeclarationId(id);
    setRefusalDialogOpen(true);
  };

  // Confirm refusal with reason
  const handleConfirmRefusal = async (reason) => {
    if (!refusalDeclarationId) return;
    const declaration = declarations.find(d => d.id === refusalDeclarationId);
    if (declaration) {
      const traceEntry = {
        userId: user?.id || '',
        userName: user?.fullName || user?.username || '',
        action: t('traceability.refused').replace('{reason}', reason.label || reason.id), // Ex: "Déclaration refusée (Motif)"
        date: new Date().toISOString(),
      };
      const updatedDeclaration = {
        ...declaration,
        status: 'refuse' as const,
        refusalReason: reason.id,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur',
        traceability: [...(declaration.traceability || []), traceEntry],
      };
      const { updateDeclaration } = await import('../../services/declarationService');
      await updateDeclaration(refusalDeclarationId, updatedDeclaration);
      // Add notification for chauffeur
      const { addNotification } = await import('../../services/notificationService');
      await addNotification({
  chauffeurId: declaration.chauffeurId,
  declarationId: declaration.id,
  message: `Votre déclaration a été refusée. Motif: ${reason.label || reason.id}`,
  createdAt: new Date().toISOString(),
  read: false
      });
      toast.success('Déclaration refusée');
    }
    setRefusalDialogOpen(false);
    setRefusalDeclarationId(null);
    setPendingRefusalReason(null);
  };
        {/* ...existing code... */}
        {/* Refusal Reason Dialog toujours monté à la fin du return principal */}
        <RefusalReasonDialog
          isOpen={refusalDialogOpen}
          onClose={() => { setRefusalDialogOpen(false); setRefusalDeclarationId(null); }}
          onConfirm={handleConfirmRefusal}
          language={settings.language || 'fr'}
        />
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

  // --- Clients state ---
  const [clients, setClients] = useState([]);
  // Indique s'il y a au moins un client en attente de validation
  const hasPendingClients = clients.some(c => c.status === 'pending');
  const [editingClient, setEditingClient] = useState(null);
  const [showEditClient, setShowEditClient] = useState(false);
  const [clientToDelete, setClientToDelete] = useState(null);
  const [zoomedClient, setZoomedClient] = useState(null);
  const [showClientMap, setShowClientMap] = useState(false);

  // Listen to clients in Firestore
  useEffect(() => {
    let unsubscribe;
    import('../../services/clientService').then(({ listenClients }) => {
      unsubscribe = listenClients(setClients);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // Handlers for client CRUD
  const handleEditClient = (client) => {
    setEditingClient(client);
    setShowEditClient(true);
  };

  // Handler to validate a client (set status to 'validated')
  const handleValidateClient = async (client) => {
    try {
      const { updateClient } = await import('../../services/clientService');
      await updateClient(client.id, { status: 'validated' }, user);
      toast.success('Client validé');
    } catch {
      toast.error('Erreur lors de la validation du client');
    }
  };

  // Ajout/édition client
  const handleSubmitClient = async (client, isEdit) => {
    try {
      if (isEdit && editingClient) {
        const { updateClient } = await import('../../services/clientService');
        await updateClient(editingClient.id, client, user);
        toast.success('Client modifié');
      } else {
        const { addClient } = await import('../../services/clientService');
        await addClient({ ...client, createdAt: new Date().toISOString() }, user);
        toast.success('Client ajouté');
      }
      setShowEditClient(false);
      setEditingClient(null);
    } catch {
      toast.error('Erreur lors de l\'enregistrement du client');
    }
  };
  const handleDeleteClient = (id) => setClientToDelete(id);
  const confirmDeleteClient = async () => {
    if (!clientToDelete) return;
    try {
      const { deleteClient } = await import('../../services/clientService');
      await deleteClient(clientToDelete);
      toast.success('Client supprimé');
    } catch {
      toast.error('Erreur lors de la suppression');
    }
    setClientToDelete(null);
  };
  const handleZoomClient = (client) => {
    setZoomedClient(client);
    setShowClientMap(true);
  };

  // Ajout d'un statut enrichi pour chaque chauffeur (en_panne si au moins une déclaration en panne)
  const [chauffeurs, setChauffeurs] = useState<(Chauffeur & { isEnPanne?: boolean })[]>([]);

  // Synchronisation temps réel des chauffeurs depuis Firestore
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenChauffeurs } = await import('../../services/chauffeurService');
      unsubscribe = listenChauffeurs((cloudChauffeurs) => {
        // Pour chaque chauffeur, on vérifie s'il a une déclaration en panne
        const mappedChauffeurs = cloudChauffeurs.map((c: any) => {
          const chauffeurId = c.id;
          // On cherche une déclaration en panne pour ce chauffeur
          const hasPanne = declarations.some(
            (d) => d.chauffeurName && d.chauffeurName.toLowerCase().includes((c.fullName || '').toLowerCase()) && d.status === 'en_panne'
          );
          return {
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
            isEnPanne: hasPanne,
            latitude: typeof c.latitude === 'number' ? c.latitude : (c.coordinates?.lat ?? undefined),
            longitude: typeof c.longitude === 'number' ? c.longitude : (c.coordinates?.lng ?? undefined),
            isTracking: typeof c.isTracking === 'boolean' ? c.isTracking : false,
            lastPositionAt: c.lastPositionAt,
            isOnline: typeof c.isOnline === 'boolean' ? c.isOnline : false,
            gpsActive: typeof c.gpsActive === 'boolean' ? c.gpsActive : false,
          };
        });
        setChauffeurs(mappedChauffeurs);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [declarations, isOnline]);

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
    const enRoute = declarations.filter(d => d.status === 'en_route').length;
    const enPanne = declarations.filter(d => d.status === 'en_panne').length;
    return {
      enAttente,
      enRoute,
      enPanne
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
      let passwordHash = editingChauffeur.password;
      let salt = editingChauffeur.salt || Math.random().toString(36).substring(2, 15);
      if (newChauffeur.password) {
        passwordHash = await (await import('../../utils/authUtils')).simpleHash(newChauffeur.password, salt);
      }
      const updatedChauffeur: Chauffeur = {
        ...editingChauffeur,
        firstName,
        lastName,
        fullName: `${newChauffeur.employeeType === 'externe' ? 'TP - ' : ''}${newChauffeur.fullName}`,
        username: newChauffeur.username,
        password: passwordHash,
        salt: salt,
        phone: newChauffeur.phone,
        vehicleType: newChauffeur.vehicleType,
        employeeType: newChauffeur.employeeType
      };
      const { updateChauffeur } = await import('../../services/chauffeurService');
      const { updateUser } = await import('../../services/userService');
      await updateChauffeur(editingChauffeur.id, updatedChauffeur);
      await updateUser(editingChauffeur.id, { passwordHash, salt });
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
      const traceEntry = {
        userId: user?.id || '',
        userName: user?.fullName || user?.username || '',
        action: t('traceability.validated'), // Ex: "Déclaration validée"
        date: new Date().toISOString(),
      };
      const updatedDeclaration = {
        ...declaration,
        status: 'valide' as const,
        validatedAt: new Date().toISOString(),
        validatedBy: 'Planificateur',
        traceability: [...(declaration.traceability || []), traceEntry],
      };
      const { updateDeclaration } = await import('../../services/declarationService');
    await updateDeclaration(id, updatedDeclaration);
    // Add notification for chauffeur
    const { addNotification } = await import('../../services/notificationService');
    await addNotification({
  chauffeurId: declaration.chauffeurId,
  declarationId: declaration.id,
  message: `Votre déclaration a été validée.`,
  createdAt: new Date().toISOString(),
  read: false
    });
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
    const traceEntry = {
      userId: user?.id || '',
      userName: user?.fullName || user?.username || '',
      action: t('traceability.modified'), // Ex: "Déclaration modifiée"
      date: new Date().toISOString(),
    };
    const newDeclaration = {
      ...updatedDeclaration,
      traceability: [...(updatedDeclaration.traceability || []), traceEntry],
    };
    const { updateDeclaration } = await import('../../services/declarationService');
    await updateDeclaration(updatedDeclaration.id, newDeclaration);
    setEditingDeclaration(null);
    toast.success('Déclaration mise à jour');
  };

  // Gestion suppression programme (déclaration) avec confirmation
  const [declarationToDelete, setDeclarationToDelete] = useState<string | null>(null);
  const handleDeleteDeclaration = (id: string) => {
    setDeclarationToDelete(id);
  };
  const confirmDeleteDeclaration = async () => {
    if (!declarationToDelete) return;
    try {
      const { deleteDeclaration } = await import('../../services/declarationService');
      await deleteDeclaration(declarationToDelete);
      toast.success('Déclaration supprimée');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
    setDeclarationToDelete(null);
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

  const [gpsActive, setGpsActive] = useState(false);
  const [userPosition, setUserPosition] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);

  if (activeTab === 'profile') {
    if (viewMode === 'mobile') {
      // En mobile, header mobile natif du profil
      return <ProfilePage onBack={() => setActiveTab('dashboard')} />;
    }
    // Desktop : Header global + contenu profil centré
    return (
      <div>
        <Header onProfileClick={handleProfileClick} />
        <div className="p-6">
          <ProfilePage onBack={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  // --- GPS state for TracageSection ---
  if (activeTab === 'tracage') {
    if (viewMode === 'desktop') {
      return (
        <div className="bg-background min-h-screen flex flex-col">
          <Header onProfileClick={handleProfileClick} />
          <div className="flex min-h-[calc(100vh-4rem)] relative">
            {/* Badge en ligne en haut à droite, desktop uniquement */}
            <span
              className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow`}
              title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </span>
            <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} hasPendingClients={hasPendingClients} />
            <div className="flex-1 p-6 pt-16 overflow-auto">
              <h2 className="text-2xl font-bold mb-4">{t('tracage.title')}</h2>
              <TracageSection 
                gpsActive={gpsActive}
                setGpsActive={setGpsActive}
                userPosition={userPosition}
                setUserPosition={setUserPosition}
              />
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
              title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </span>
          </div>
          <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} hasPendingClients={hasPendingClients} />
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-4">{t('tracage.title')}</h2>
            {/* Carte (map) en premier */}
            <TracageSection 
              gpsActive={gpsActive}
              setGpsActive={setGpsActive}
              userPosition={userPosition}
              setUserPosition={setUserPosition}
            />
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
            title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
          >
            <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
            {isOnline ? t('dashboard.online') : t('dashboard.offline')}
          </span>
        </div>
      ) : null}
      <div className={viewMode === 'mobile' ? 'flex flex-col h-auto gap-2' : 'flex flex-row min-h-[calc(100vh-4rem)] relative'}>
        <PlanificateurSidebar activeTab={activeTab} onTabChange={setActiveTab} hasPendingClients={hasPendingClients} />
        <div className="flex-1 p-6 pt-16 overflow-auto relative">
          {/* Badge En ligne en haut à droite du bloc content, sous le header, à l'intérieur mais hors de la sidebar (desktop uniquement) */}
          {viewMode !== 'mobile' && (
            <span
              className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow`}
              title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </span>
          )}
          {activeTab === 'tracage' && viewMode === 'desktop' && (
  <span
    className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10 flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow`}
    title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
  >
    <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
    {isOnline ? t('dashboard.online') : t('dashboard.offline')}
  </span>
)}
          {/* ...existing code for tabs and content... */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                <div className="mb-4">
                  <h1 className="text-2xl font-bold text-foreground text-left">Tableau de bord - Planificateur</h1>
                </div>
                {/* Toujours aligné à gauche pour En Attente, Déclarations récentes prend toute la largeur */}
                <div className="w-full max-w-xl">
                  <PlanificateurStats
                    stats={stats}
                    onEnAttenteClick={handleEnAttenteClick}
                    onEnRouteClick={() => {
                      setFilterStatus('en_route');
                      setActiveTab('declarations');
                    }}
                    onEnPanneClick={() => {
                      setFilterStatus('en_panne');
                      setActiveTab('declarations');
                    }}
                  />
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
                  filterOptions={[ 
                    { value: 'en_route', label: 'En Route' },
                    { value: 'en_cours', label: 'En Attente' },
                    { value: 'valide', label: 'Validé' },
                    { value: 'refuse', label: 'Refusé' }
                  ]}
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
                    {/* Confirmation suppression programme (déclaration) */}
                    <AlertDialog open={!!declarationToDelete} onOpenChange={open => { if (!open) setDeclarationToDelete(null); }}>
                      <AlertDialogContent style={{ zIndex: 10000, position: 'fixed' }} aria-describedby="delete-declaration-desc">
                        <AlertDialogHeader>
                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                        </AlertDialogHeader>
                        <AlertDialogDescription id="delete-declaration-desc">
                          Êtes-vous sûr de vouloir supprimer ce programme ? Cette action est irréversible.
                        </AlertDialogDescription>
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setDeclarationToDelete(null)}>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={confirmDeleteDeclaration}>Supprimer</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
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
                  onSearchColumnChange={col => setSearchColumn(col as 'number' | 'chauffeurName')}
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
                  <h2 className="text-2xl font-bold">{t('chauffeurs.title')}</h2>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => setShowCreateChauffeur(true)}
                  >
                    <Plus className="h-4 w-4" />
                    {t('chauffeurs.add')}
                  </Button>
                </div>
                {/* Barre de recherche/filtre pour chauffeurs */}
                <SearchAndFilter
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={[
                    { value: 'actif', label: t('chauffeurs.active') },
                    { value: 'inactif', label: t('chauffeurs.inactive') }
                  ]}
                  searchPlaceholder={t('chauffeurs.searchPlaceholder')}
                  filterPlaceholder={t('chauffeurs.filterPlaceholder')}
                  searchColumn={searchColumn}
                  onSearchColumnChange={col => setSearchColumn(col as 'number' | 'chauffeurName')}
                  searchColumnOptions={[
                    { value: 'number', label: t('chauffeurs.columnNumber') },
                    { value: 'chauffeurName', label: t('chauffeurs.columnChauffeur') }
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
                      <AlertDialogTitle>{t('chauffeurs.deleteTitle')}</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription id="delete-chauffeur-desc">
                      {t('chauffeurs.deleteDesc')}
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setChauffeurToDelete(null)}>{t('chauffeurs.cancel')}</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeleteChauffeur}>{t('chauffeurs.delete')}</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
            {/* ...dialogs and modals... */}

            {/* Onglet Clients */}
            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between mb-2">
                  <h2 className="text-2xl font-bold">Gestion des Clients</h2>
                  <Button 
                    className="flex items-center gap-2"
                    onClick={() => { setEditingClient(null); setShowEditClient(true); }}
                  >
                    <Plus className="h-4 w-4" />
                    Ajouter
                  </Button>
                </div>
                {/* Barre de recherche/filtre pour clients */}
                <SearchAndFilter
                  searchValue={searchValue}
                  onSearchChange={setSearchValue}
                  filterValue={filterStatus}
                  onFilterChange={setFilterStatus}
                  filterOptions={[]}
                  searchPlaceholder="Rechercher par nom..."
                  filterPlaceholder="Filtrer..."
                  searchColumn={searchColumn}
                  onSearchColumnChange={value => setSearchColumn(value as 'number' | 'chauffeurName')}
                  searchColumnOptions={[
                    { value: 'number', label: 'Numéro' },
                    { value: 'clientName', label: 'Client' }
                  ]}
                />
                <ClientsTable
                  clients={clients.filter(c => !searchValue || c.name.toLowerCase().includes(searchValue.toLowerCase()))}
                  onEditClient={client => {
                    setEditingClient(client);
                    setShowEditClient(true);
                    setConsultMode(false);
                  }}
                  onConsultClient={client => {
                    setEditingClient(client);
                    setShowEditClient(true);
                    setConsultMode(true);
                  }}
                  onDeleteClient={handleDeleteClient}
                  onZoomClient={handleZoomClient}
                  onValidateClient={handleValidateClient}
                  fontSize={tableFontSize as any}
                />
                <ClientMapDialog
                  isOpen={showClientMap}
                  onClose={() => setShowClientMap(false)}
                  client={zoomedClient}
                />
                {/* Dialog de suppression client */}
                <AlertDialog open={!!clientToDelete} onOpenChange={open => { if (!open) setClientToDelete(null); }}>
                  <AlertDialogContent style={{ zIndex: 10000, position: 'fixed' }} aria-describedby="delete-client-desc">
                    <AlertDialogHeader>
                      <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogDescription id="delete-client-desc">
                      Êtes-vous sûr de vouloir supprimer ce client ? Cette action est irréversible.
                    </AlertDialogDescription>
                    <AlertDialogFooter>
                      <AlertDialogCancel onClick={() => setClientToDelete(null)}>Annuler</AlertDialogCancel>
                      <AlertDialogAction onClick={confirmDeleteClient}>Supprimer</AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
                {/* Dialog d'ajout/édition client */}
                <ClientDialog
                  isOpen={showEditClient}
                  onClose={() => { setShowEditClient(false); setEditingClient(null); setConsultMode(false); }}
                  onSubmit={handleSubmitClient}
                  editingClient={editingClient}
                  readOnly={consultMode}
                />
              </div>
            )}
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
            {/* Refusal Reason Dialog toujours monté à la fin du return principal */}
            <RefusalReasonDialog
              isOpen={refusalDialogOpen}
              onClose={() => { setRefusalDialogOpen(false); setRefusalDeclarationId(null); }}
              onConfirm={handleConfirmRefusal}
              language={settings.language || 'fr'}
            />

        </div>
      </div>
    </div>
  );
}
export default PlanificateurDashboard;
