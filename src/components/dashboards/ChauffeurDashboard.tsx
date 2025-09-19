// ...imports...

// Aperçu photo reçu (doit être déclaré dans le composant, après les imports)
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import { DocumentReference, DocumentData } from 'firebase/firestore';

import React, { useState, useEffect } from 'react';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import CameraPreviewModal from '../CameraPreviewModal';
import { useAuth } from '../../contexts/AuthContext';
import { useSharedData } from '../../contexts/SharedDataContext';
import { useTranslation } from '../../hooks/useTranslation';
import { toast } from '../ui/use-toast';
import { useIsMobile } from '../../hooks/use-mobile';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '../ui/alert-dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { MapPin, Plus, Clock, Search, Edit, Trash2 } from 'lucide-react';
// ...existing code...
import ChauffeurSidebar from './ChauffeurSidebar';
import { Declaration, Warehouse, PaymentReceipt } from '../../types';
import SimpleDeclarationNumberForm from '../SimpleDeclarationNumberForm';
import TracageSection from '../TracageSection';
import SearchAndFilter from '../SearchAndFilter';
import EditDeclarationDialog from '../EditDeclarationDialog';
import Header from '../Header';
import ProfilePage from '../ProfilePage';
import { getAllRefusalReasons } from '../../services/refusalReasonService';

import { getCurrentPosition } from '../../utils/gpsUtils';

import { doc, updateDoc } from 'firebase/firestore';
import { db as firestore } from '../../services/firebaseClient';

const ChauffeurDashboard = () => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  // Sync unread count to window for Header badge
  useEffect(() => {
    if (typeof window !== 'undefined') {
      (window as any).unreadChauffeurNotifications = unreadCount;
    }
  }, [unreadCount]);
  // Listen for notification button click from Header
  useEffect(() => {
    const handler = () => setShowNotifications(true);
    window.addEventListener('showChauffeurNotifications', handler);
    return () => window.removeEventListener('showChauffeurNotifications', handler);
  }, []);
  // Mark notification as read
  const handleMarkAsRead = async (id: string) => {
    const { markNotificationAsRead } = await import('../../services/notificationService');
    await markNotificationAsRead(id);
    // Refresh notifications
    const { getNotificationsForChauffeur } = await import('../../services/notificationService');
    const notifs = await getNotificationsForChauffeur(auth.user.id);
    setNotifications(notifs);
    setUnreadCount(notifs.filter((n: any) => !n.read).length);
  };
  const { t, settings } = useTranslation();
  const auth = useAuth();
  useEffect(() => {
    async function fetchNotifications() {
      if (!auth?.user?.id) return;
      const { getNotificationsForChauffeur } = await import('../../services/notificationService');
      const notifs = await getNotificationsForChauffeur(auth.user.id);
      setNotifications(notifs);
      setUnreadCount(notifs.filter((n: any) => !n.read).length);
    }
    fetchNotifications();
  }, [auth?.user?.id]);
  const [gpsActive, setGpsActive] = useState(false);
  const [gpsPosition, setGpsPosition] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  // Hooks d'état GPS doivent être déclarés en tout premier
  // ...existing code...
  // Demande d'activation GPS au démarrage si paramètre admin activé
  useEffect(() => {
    // Utiliser settings directement, ne pas appeler useTranslation ici
    if (settings.gpsActivationRequestEnabled && !gpsActive) {
      (async () => {
        const pos = await getCurrentPosition();
        if (pos) {
          setGpsPosition(pos);
          setGpsActive(true);
        } else {
          setGpsActive(false);
          setGpsPosition(null);
          toast({ title: 'Accès à la position refusé ou indisponible', variant: 'destructive' });
        }
      })();
    }
  }, [gpsActive, settings.gpsActivationRequestEnabled]);
  // TOUS les hooks doivent être appelés avant tout return !
  // Heartbeat Firestore: met à jour lastActive toutes les 60s
  useEffect(() => {
    if (!auth?.user?.id || !settings.heartbeatOnlineEnabled) return;
    const userRef = doc(firestore, 'users', auth.user.id);
    let interval: NodeJS.Timeout | undefined;
    if (settings.heartbeatOnlineEnabled) {
      interval = setInterval(() => {
        updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
      }, (settings.heartbeatOnlineInterval || 60) * 1000);
    }
    if (settings.heartbeatOnlineImmediate) {
      updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
    }
    // Set offline on unload/tab close
    const handleUnload = () => {
      updateDoc(userRef, { isOnline: false });
    };
    window.addEventListener('beforeunload', handleUnload);
    return () => {
      if (interval) clearInterval(interval);
      window.removeEventListener('beforeunload', handleUnload);
      updateDoc(userRef, { isOnline: false });
    };
  }, [auth?.user?.id, settings.heartbeatOnlineEnabled, settings.heartbeatOnlineImmediate, settings.heartbeatOnlineInterval]);

  

  // Sync gpsActive to Firestore (users & chauffeurs) when it changes
  useEffect(() => {
    if (!auth?.user?.id) return;
    const userRef = doc(firestore, 'users', auth.user.id);
    const chauffeurRef = doc(firestore, 'chauffeurs', auth.user.id);
    updateDoc(userRef, { gpsActive });
    updateDoc(chauffeurRef, { gpsActive });
  }, [gpsActive, auth?.user?.id]);
  const [showGpsConfirm, setShowGpsConfirm] = useState(false);
  // Aperçu photo reçu (doit être déclaré dans le composant, après les imports)
  const [previewPhotoUrl, setPreviewPhotoUrl] = useState<string | null>(null);
  // TOUS les hooks doivent être appelés avant tout return !
  const { isOnline } = useOnlineStatus();
  const { declarations, addDeclaration, updateDeclaration, deleteDeclaration, companies } = useSharedData();
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

  useEffect(() => {
    if (!auth?.user?.id || !gpsActive || !settings.heartbeatPositionEnabled) return;
    const userRef = doc(firestore, 'users', auth.user.id);
    const chauffeurRef = doc(firestore, 'chauffeurs', auth.user.id);
    const sendPosition = async () => {
      const pos = await getCurrentPosition();
      if (pos) {
        const now = Date.now();
        const positionData = {
          lastPosition: {
            lat: pos.lat,
            lng: pos.lng,
            at: now
          }
        };
        updateDoc(userRef, positionData);
        updateDoc(chauffeurRef, positionData);

        // Ajout uniquement dans le champ positions de la déclaration en_route
        if (enRouteDeclaration) {
          const declarationRef = doc(firestore, 'declarations', enRouteDeclaration.id);
          const tracePoint = {
            lat: pos.lat,
            lng: pos.lng,
            at: now
          };
          const { arrayUnion } = await import('firebase/firestore');
          await updateDoc(declarationRef, {
            positions: arrayUnion(tracePoint)
          });
        }
      }
    };
    let interval: NodeJS.Timeout | undefined;
    if (settings.heartbeatPositionEnabled) {
      interval = setInterval(sendPosition, (settings.heartbeatPositionInterval || 20) * 1000);
    }
    if (settings.heartbeatPositionImmediate) {
      sendPosition();
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [auth?.user?.id, gpsActive, settings.heartbeatPositionEnabled, settings.heartbeatPositionImmediate, settings.heartbeatPositionInterval]);

  // Reçus de paiement structurés
  const [paymentReceipts, setPaymentReceipts] = useState<PaymentReceipt[]>([]);
  const [enRouteDeclaration, setEnRouteDeclaration] = useState<Declaration | null>(null);
  // Synchronise paymentReceipts avec ceux de la déclaration en cours si présents
  useEffect(() => {
    if (enRouteDeclaration && Array.isArray(enRouteDeclaration.paymentReceipts)) {
      setPaymentReceipts(enRouteDeclaration.paymentReceipts);
    } else if (!enRouteDeclaration) {
      setPaymentReceipts([]);
    }
  }, [enRouteDeclaration]);
  const [cameraPreview, setCameraPreview] = useState<string | null>(null);
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
  const [editingDeclaration, setEditingDeclaration] = useState<Declaration | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  // On utilise activeTab pour la navigation (dashboard, tracage, profile)
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tracage' | 'profile'>('dashboard');
  // Track previous tab to detect tab switch
  const [prevTab, setPrevTab] = useState<'dashboard' | 'tracage' | 'profile'>('dashboard');

  // Effect: auto-activate GPS when entering 'tracage' from another tab
  useEffect(() => {
    if (activeTab === 'tracage' && prevTab !== 'tracage' && !gpsActive) {
      // Try to get position and activate GPS
      (async () => {
        const pos = await getCurrentPosition();
        if (pos) {
          setGpsPosition(pos);
          setGpsActive(true);
        } else {
          setGpsActive(false);
          setGpsPosition(null);
          toast({ title: 'Accès à la position refusé ou indisponible', variant: 'destructive' });
        }
      })();
    }
    setPrevTab(activeTab);
  }, [activeTab]);
  // Pour la confirmation d'annulation en mode mobile
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
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

  // Pour le dialog motif de refus
  const [refusalDialogOpen, setRefusalDialogOpen] = useState(false);
  const [refusalReasonLabel, setRefusalReasonLabel] = useState<string | null>(null);

  useEffect(() => {
    if (auth && auth.user) {
      // Si une déclaration en_route ou en_panne existe pour ce chauffeur, la garder en mémoire et ouvrir le formulaire
      const enRouteOrPanne = declarations.find(
        (d) => d.chauffeurId === auth.user.id && (d.status === 'en_route' || d.status === 'en_panne')
      );
      if (enRouteOrPanne) {
        setEnRouteDeclaration(enRouteOrPanne);
        if (!isCreating) setIsCreating(true); // Force l'ouverture du formulaire si ce n'est pas déjà le cas
        // Pré-remplir les champs si besoin (distance/deliveryFees vides)
        setFormData((prev) => ({
          ...prev,
          number: enRouteOrPanne.number || '',
          year: enRouteOrPanne.year || '',
          month: enRouteOrPanne.month || '',
          programNumber: enRouteOrPanne.programNumber || '',
          notes: enRouteOrPanne.notes || '',
          distance: enRouteOrPanne.distance ? String(enRouteOrPanne.distance) : '',
          deliveryFees: enRouteOrPanne.deliveryFees ? String(enRouteOrPanne.deliveryFees) : ''
        }));
      } else {
        setEnRouteDeclaration(null);
      }
    }
  }, [auth, declarations]);

  const [searchTerm, setSearchTerm] = useState('');

  // Gestion absence de contexte ou d'utilisateur (après tous les hooks)
  if (!auth || !auth.user) {
    return <div>Utilisateur non trouvé</div>;
  }

  const { user } = auth;
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
    { value: 'en_route', label: t('dashboard.onRoad') },
    { value: 'en_panne', label: t('declarations.breakdown') },
    { value: 'en_cours', label: t('dashboard.pending') },
    { value: 'valide', label: t('dashboard.validated') },
    { value: 'refuse', label: t('dashboard.refused') }
  ];

  // Nouveau workflow :
  // 1. Création = statut 'en_route' si référence (programNumber) OK, formulaire reste ouvert
  // 2. Bouton 'Déclarer' pour passer à 'en_cours' (distance ou frais requis), formulaire se ferme
  // (supprimé, déjà déclaré plus haut)

  const handleCreateDeclaration = async () => {
    // Vérifier que le numéro de programme est complètement rempli (4 chiffres)
    if (!formData.programNumber || formData.programNumber.length !== 4) {
      alert(t('declarations.programNumberRequired'));
      return;
    }
    // Vérifier unicité de la référence pour ce chauffeur
    const referenceExists = chauffeurDeclarations.some(d =>
      d.number === formData.number &&
      d.year === formData.year &&
      d.month === formData.month &&
      d.programNumber === formData.programNumber
    );
    if (referenceExists) {
      toast({
        title: t('declarations.referenceAlreadyExists'),
        variant: 'destructive',
      });
      return;
    }
    // Création en mode "En Route" (pas besoin de distance/frais)
    const traceEntry = {
      userId: auth.user?.id || '',
      userName: auth.user?.fullName || auth.user?.username || '',
      action: 'Création',
      date: new Date().toISOString(),
    };
    const newDeclaration: Omit<Declaration, 'id'> = {
      number: formData.number,
      year: formData.year,
      month: formData.month,
      programNumber: formData.programNumber,
      chauffeurId: auth.user!.id,
      chauffeurName: auth.user!.fullName,
      status: 'en_route',
      createdAt: new Date().toISOString(),
      notes: formData.notes,
  paymentReceipts: paymentReceipts.length > 0 ? paymentReceipts : undefined,
      traceability: [traceEntry],
    };
    if (newDeclaration.paymentReceipts === undefined) {
      delete (newDeclaration as any).paymentReceipts;
    }
    // Ajout Firestore
    const docRef = await addDeclaration(newDeclaration as Declaration) as unknown as DocumentReference<DocumentData>;
    let declarationId = '';
    if (docRef && typeof docRef.id === 'string') {
      declarationId = docRef.id;
      // Met à jour le document pour y ajouter le champ id Firestore
      const { updateDeclaration } = await import('../../services/declarationService');
      await updateDeclaration(declarationId, { id: declarationId });
  setEnRouteDeclaration({ ...newDeclaration, id: declarationId, paymentReceipts: paymentReceipts.length > 0 ? paymentReceipts : undefined });
    }
    // On ne reset pas le form, il reste ouvert pour la suite
  };

  // Validation de la déclaration (distance ou frais requis)
  const handleDeclareEnRoute = async () => {
    if (!formData.distance && !formData.deliveryFees) {
      alert(t('declarations.distanceOrFeesRequired'));
      return;
    }
    if (enRouteDeclaration) {
      // Préparer l'objet sans undefined
      const updated: any = {
        ...enRouteDeclaration,
        status: 'en_cours'
      };
      if (formData.distance) updated.distance = parseInt(formData.distance);
      else if ('distance' in updated) delete updated.distance;
      if (formData.deliveryFees) updated.deliveryFees = parseInt(formData.deliveryFees);
      else if ('deliveryFees' in updated) delete updated.deliveryFees;
  updated.paymentReceipts = paymentReceipts.length > 0 ? paymentReceipts : undefined;
      if (updated.paymentReceipts === undefined) {
        delete updated.paymentReceipts;
      }
      // Ajout traçabilité
      const traceEntry = {
        userId: auth.user?.id || '',
        userName: auth.user?.fullName || auth.user?.username || '',
        action: 'Déclarée (en_cours)',
        date: new Date().toISOString(),
      };
      await updateDeclaration(enRouteDeclaration.id, {
        ...updated,
        traceability: [...(enRouteDeclaration.traceability || []), traceEntry],
      });
      setEnRouteDeclaration(null);
      setFormData({
        distance: '',
        deliveryFees: '',
        notes: '',
        number: '',
        year: '',
        month: '',
        programNumber: ''
      });
      setPaymentReceipts([]);
      setIsCreating(false);
    }
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

  // Modifie getStatusBadge pour ouvrir le dialog si refusé
  const getStatusBadge = (status: string, declaration?: Declaration) => {
    switch (status) {
      case 'en_route':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return (
          <button
            type="button"
            className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 cursor-pointer underline rounded-full px-2.5 py-0.5 text-xs font-semibold inline-flex items-center border border-transparent focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            style={{ minWidth: 0 }}
            onClick={async (e) => {
              e.stopPropagation();
              if (declaration && declaration.refusalReason) {
                const reasons = await getAllRefusalReasons();
                const found = reasons.find(r => r.id === declaration.refusalReason);
                setRefusalReasonLabel(found ? (found[settings.language || 'fr'] || found['fr']) : null);
                setRefusalDialogOpen(true);
                console.log('Ouverture dialog refus motif:', found);
              } else {
                setRefusalReasonLabel(null);
                setRefusalDialogOpen(true);
                console.log('Ouverture dialog refus motif: aucun motif');
              }
            }}
            title={t('dashboard.refused')}
          >
            {t('dashboard.refused')}
          </button>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // Si on affiche le profil, on rend ProfilePage comme dans PlanificateurDashboard
  if (activeTab === 'profile') {
    if (isMobile) {
      // En mobile, pas de Header global, ProfilePage gère son header mobile
      return <ProfilePage onBack={() => setActiveTab('dashboard')} />;
    }
    // Desktop : Header global + contenu profil centré
    return (
      <div>
        <Header onProfileClick={() => setActiveTab('dashboard')} />
        <div className="p-6">
          <ProfilePage onBack={() => setActiveTab('dashboard')} />
        </div>
      </div>
    );
  }

  // (supprimé, déjà géré plus haut avec 'profile')

  return (
    <div className={isMobile ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'min-h-screen bg-background w-full overflow-x-hidden'}>
      <Header onProfileClick={() => setActiveTab('profile')} />
      {/* Badge En ligne + GPS : mobile sous le header, desktop en haut à droite (absolute, hors sidebar) */}
      {isMobile ? (
        <>
          <div className="flex px-2 pt-3 mb-2 items-center gap-2">
            <span
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
              title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </span>
            {/* GPS Button (mobile, à côté du badge) */}
            <Button
              type="button"
              className={
                `ml-2 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ` +
                (gpsActive
                  ? 'bg-green-500 border-green-600 shadow-lg ring-2 ring-green-300 animate-pulse'
                  : 'bg-red-500 border-red-600')
              }
              style={{ boxShadow: gpsActive ? '0 0 8px 2px #22c55e' : 'none' }}
              title={gpsActive ? 'Désactiver le GPS' : 'Activer le GPS'}
              onClick={async e => {
                if (gpsActive) {
                  setShowGpsConfirm(true);
                } else {
                  // Activation : demande la position
                  const pos = await getCurrentPosition();
                  if (pos) {
                    setGpsPosition(pos);
                    setGpsActive(true);
                  } else {
                    setGpsActive(false);
                    setGpsPosition(null);
                    toast({ title: 'Accès à la position refusé ou indisponible', variant: 'destructive' });
                  }
                }
              }}
            >
              <span className="material-icons text-white">gps_fixed</span>
            </Button>
            {/* Confirmation dialog uniquement pour la désactivation */}
            <AlertDialog open={showGpsConfirm} onOpenChange={setShowGpsConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Désactiver le GPS</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir désactiver le GPS ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { setGpsActive(false); setGpsPosition(null); setShowGpsConfirm(false); }}>Désactiver</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
          {chauffeurDeclarations.some(d => d.status === 'en_panne') && (
            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-b-2 border-red-500 text-red-700 font-semibold mb-2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414A7.975 7.975 0 0012 6c-2.21 0-4.21.896-5.95 2.364l-1.414-1.414A9.969 9.969 0 0112 4c2.761 0 5.261 1.12 7.071 2.929zM4.222 19.778A9.969 9.969 0 0112 20c2.761 0 5.261-1.12 7.071-2.929l-1.414-1.414A7.975 7.975 0 0112 18c-2.21 0-4.21-.896-5.95-2.364l-1.414 1.414z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{t('declarations.breakdown')}</span>
            </div>
          )}
        </>
      ) : null}
      {/* Bandeau En panne sous le badge en ligne (desktop uniquement) */}
      {!isMobile && chauffeurDeclarations.some(d => d.status === 'en_panne') && (
        <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-b-2 border-red-500 text-red-700 font-semibold">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414A7.975 7.975 0 0012 6c-2.21 0-4.21.896-5.95 2.364l-1.414-1.414A9.969 9.969 0 0112 4c2.761 0 5.261 1.12 7.071 2.929zM4.222 19.778A9.969 9.969 0 0112 20c2.761 0 5.261-1.12 7.071-2.929l-1.414-1.414A7.975 7.975 0 0112 18c-2.21 0-4.21-.896-5.95-2.364l-1.414 1.414z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span>{t('declarations.breakdown')}</span>
        </div>
      )}
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
                    <div className="grid grid-cols-4 gap-2 text-center">
                      {/* En Route */}
                      <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                        <div className="text-xl font-bold text-blue-700 dark:text-blue-400">
                          {chauffeurDeclarations.filter(d => d.status === 'en_route').length}
                        </div>
                        <div className="text-xs text-blue-600 dark:text-blue-300">{t('dashboard.onRoad')}</div>
                      </div>
                      {/* En Cours */}
                      <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                        <div className="text-xl font-bold text-yellow-700 dark:text-yellow-400">
                          {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                        </div>
                        <div className="text-xs text-yellow-600 dark:text-yellow-300">{t('dashboard.pending')}</div>
                      </div>
                      {/* Validé */}
                      <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                        <div className="text-xl font-bold text-green-700 dark:text-green-400">
                          {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                        </div>
                        <div className="text-xs text-green-600 dark:text-green-300">{t('dashboard.validated')}</div>
                      </div>
                      {/* Refusé */}
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
                  <CardHeader className="pb-3 flex flex-row items-start justify-between">
                    <CardTitle className="flex items-center gap-2 text-card-foreground text-base sm:text-lg">
                      <Plus className="h-4 w-4" />
                      {t('dashboard.newDeclaration')}
                    </CardTitle>
                    {/* En Panne button, only if enRouteDeclaration exists and is en_route */}
                    {enRouteDeclaration && enRouteDeclaration.status === 'en_route' && (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="flex items-center gap-2 ml-2" title={t('declarations.breakdown')}>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {!isMobile && (t && typeof t === 'function' ? t('declarations.breakdown') : 'En panne')}
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>{t('declarations.breakdown')}</AlertDialogTitle>
                            <AlertDialogDescription>
                              {t('declarations.breakdownConfirm') || 'Êtes-vous sûr de vouloir signaler une panne pour cette déclaration ? Cette action est irréversible.'}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={async () => {
                                if (enRouteDeclaration) {
                                  const traceEntry = {
                                    userId: auth.user?.id || '',
                                    userName: auth.user?.fullName || auth.user?.username || '',
                                    action: 'Signalée en panne',
                                    date: new Date().toISOString(),
                                  };
                                  await updateDeclaration(enRouteDeclaration.id, {
                                    ...enRouteDeclaration,
                                    status: 'en_panne',
                                    traceability: [...(enRouteDeclaration.traceability || []), traceEntry],
                                  });
                                  setEnRouteDeclaration(null);
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
                                }
                              }}
                            >
                              {t('forms.yes') || 'Oui'}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    )}
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {!isCreating ? (
                      <Button onClick={() => {
                        // Ne pas reset enRouteDeclaration si une déclaration en_panne ou en_route existe
                        if (!enRouteDeclaration || (enRouteDeclaration.status !== 'en_route' && enRouteDeclaration.status !== 'en_panne')) {
                          setEnRouteDeclaration(null);
                        }
                        setIsCreating(true);
                      }} className="w-full text-sm">
                        {t('dashboard.createNewDeclaration')}
                      </Button>
                    ) : (
                      <div className="space-y-3">
                        {/* Bandeau En panne au-dessus du formulaire si la déclaration est en panne (mobile ou desktop) */}
                        {enRouteDeclaration && enRouteDeclaration.status === 'en_panne' && (
                          <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-b-2 border-red-500 text-red-700 font-semibold rounded-t-md mb-2">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414A7.975 7.975 0 0012 6c-2.21 0-4.21.896-5.95 2.364l-1.414-1.414A9.969 9.969 0 0112 4c2.761 0 5.261 1.12 7.071 2.929zM4.222 19.778A9.969 9.969 0 0112 20c2.761 0 5.261-1.12 7.071-2.929l-1.414-1.414A7.975 7.975 0 0112 18c-2.21 0-4.21-.896-5.95-2.364l-1.414 1.414z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            <span>{t('declarations.breakdown')}</span>
                          </div>
                        )}
                        <SimpleDeclarationNumberForm
                          onNumberChange={handleNumberChange}
                          onComponentsChange={handleComponentsChange}
                          {...(enRouteDeclaration
                            ? {
                                initialYear: enRouteDeclaration.year,
                                initialMonth: enRouteDeclaration.month,
                                initialProgramNumber: enRouteDeclaration.programNumber,
                                readOnly: true
                              }
                            : {})}
                        />
                        {/* Gestion structurée des reçus de paiement */}
                        {isCreating && (
                          <div className="flex flex-col gap-2 mb-2">
                            <label className="text-foreground text-sm font-medium mb-1">Reçus de paiement</label>
                            <div className={isMobile ? "flex flex-col gap-2" : "flex flex-col gap-3 w-full"}>
                              {/* Ligne de boutons d'importation en haut */}
                              <div className={isMobile ? "flex gap-2" : "flex gap-2 mb-4"}>
                                <label htmlFor="payment-receipt-upload-gallery" className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition mr-2" title="Importer une photo">
                                  +
                                  <input
                                    id="payment-receipt-upload-gallery"
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={async e => {
                                      if (e.target.files && e.target.files[0]) {
                                        const file = e.target.files[0];
                                        // Upload photo
                                        const [photoUrl] = await import('../../services/declarationService').then(s => s.uploadDeclarationPhotos([file]));
                                        // Société non sélectionnée par défaut
                                        const company = { id: '', name: '' };
                                        // Création du reçu
                                        const newReceipt = {
                                          id: Date.now().toString(),
                                          programReference: formData.programNumber,
                                          createdAt: new Date().toISOString(),
                                          chauffeurId: auth.user.id,
                                          chauffeurName: auth.user.fullName,
                                          status: 'brouillon' as 'brouillon',
                                          companyId: company.id,
                                          companyName: company.name,
                                          photoUrl
                                        };
                                        setPaymentReceipts(prev => [...prev, newReceipt]);
                                        // Ajout traçabilité
                                        const traceEntry = {
                                          userId: auth.user.id,
                                          userName: auth.user.fullName,
                                          action: t('traceability.paymentReceiptCreated'),
                                          date: new Date().toISOString()
                                        };
                                        // Si une déclaration existe déjà, mettre à jour Firestore
                                        if (enRouteDeclaration) {
                                          await updateDeclaration(enRouteDeclaration.id, {
                                            ...enRouteDeclaration,
                                            paymentReceipts: [...(enRouteDeclaration.paymentReceipts || []), newReceipt],
                                            traceability: [...(enRouteDeclaration.traceability || []), traceEntry]
                                          });
                                        }
                                      }
                                    }}
                                  />
                                </label>
                                {/* Prendre une photo avec preview intégré (CameraPreviewModal) */}
                                <button
                                  type="button"
                                  className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition"
                                  title="Prendre une photo"
                                  onClick={() => setIsCameraModalOpen(true)}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="white">
                                    <rect x="3" y="7" width="18" height="13" rx="2" stroke="white" strokeWidth="2" fill="none"/>
                                    <circle cx="12" cy="13.5" r="3.5" stroke="white" strokeWidth="2" fill="none"/>
                                    <rect x="8" y="3" width="8" height="4" rx="1" stroke="white" strokeWidth="2" fill="none"/>
                                  </svg>
                                </button>
                              </div>
                              {/* Message aucun reçu ajouté sous les boutons */}
                              {paymentReceipts.length === 0 && (
                                <div className="text-muted-foreground text-xs italic px-2 py-1 mt-2">Aucun reçu ajouté</div>
                              )}
                              {/* Liste des reçus en rectangles horizontaux (desktop) */}
                              <div className="flex flex-col gap-3 w-full mt-2">
                                {paymentReceipts.map((receipt, idx) => (
                                  <div
                                    key={receipt.id}
                                    className="relative flex flex-row items-center border rounded-lg bg-muted px-3 py-2 gap-4 w-full min-h-[48px] h-auto shadow-sm"
                                  >
                                    <img
                                      src={receipt.photoUrl}
                                      alt={`reçu-${idx}`}
                                      className="object-cover w-16 h-12 rounded-md cursor-pointer hover:opacity-80 transition"
                                      onClick={() => setPreviewPhotoUrl(receipt.photoUrl)}
                                    />
      {/* Modal d'aperçu photo reçu */}
      {previewPhotoUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70" onClick={() => setPreviewPhotoUrl(null)}>
          <div className="bg-white rounded-lg shadow-lg p-2 max-w-full max-h-full flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <img src={previewPhotoUrl} alt="Aperçu reçu" className="max-w-[90vw] max-h-[80vh] rounded-lg" />
            <button className="mt-2 px-4 py-1 bg-gray-800 text-white rounded" onClick={() => setPreviewPhotoUrl(null)}>Fermer</button>
          </div>
        </div>
      )}
                                    <div className="flex-1 min-w-0 flex flex-col justify-center">
                                      <div className="font-medium truncate">{receipt.companyName || <span className="italic text-muted-foreground">Société non renseignée</span>}</div>
                                      <div className="text-xs text-muted-foreground truncate">{receipt.status === 'brouillon' ? 'Brouillon' : 'Validée'}</div>
                                      {!isMobile && (
                                        <div className="text-xs text-muted-foreground truncate">{new Date(receipt.createdAt).toLocaleString()}</div>
                                      )}
                                    </div>
                                    <AlertDialog>
                                      <AlertDialogTrigger asChild>
                                        <button
                                          type="button"
                                          className="ml-auto p-2 text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 transition"
                                          title="Supprimer"
                                        >
                                          <Trash2 className="w-5 h-5" />
                                        </button>
                                      </AlertDialogTrigger>
                                      <AlertDialogContent>
                                        <AlertDialogHeader>
                                          <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
                                          <AlertDialogDescription>
                                            Es-tu sûr de vouloir supprimer ce reçu ? Cette action est irréversible.
                                          </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                                          <AlertDialogAction
                                            onClick={async () => {
                                              const newReceipts = paymentReceipts.filter((_, i) => i !== idx);
                                              setPaymentReceipts(newReceipts);
                                              if (enRouteDeclaration) {
                                                const { updateDeclaration } = await import('../../services/declarationService');
                                                const { deleteField } = await import('firebase/firestore');
                                                let update: any = { ...enRouteDeclaration };
                                                if (newReceipts.length > 0) {
                                                  update.paymentReceipts = newReceipts;
                                                } else {
                                                  update.paymentReceipts = deleteField();
                                                }
                                                await updateDeclaration(enRouteDeclaration.id, update);
                                              }
                                            }}
                                          >
                                            Supprimer
                                          </AlertDialogAction>
                                        </AlertDialogFooter>
                                      </AlertDialogContent>
                                    </AlertDialog>
                                  </div>
                                ))}
                              </div>
                              <CameraPreviewModal
                                isOpen={isCameraModalOpen}
                                onPhotoTaken={async (dataUrl) => {
                                  // Convertir le dataUrl en File
                                  const res = await fetch(dataUrl);
                                  const blob = await res.blob();
                                  const file = new File([blob], `photo_${Date.now()}.jpeg`, { type: blob.type });
                                  // Upload photo
                                  const [photoUrl] = await import('../../services/declarationService').then(s => s.uploadDeclarationPhotos([file]));
                                  // Société non sélectionnée par défaut
                                  const company = { id: '', name: '' };
                                  // Création du reçu
                                  const newReceipt = {
                                    id: Date.now().toString(),
                                    programReference: formData.programNumber,
                                    createdAt: new Date().toISOString(),
                                    chauffeurId: auth.user.id,
                                    chauffeurName: auth.user.fullName,
                                    status: 'brouillon' as 'brouillon',
                                    companyId: company.id,
                                    companyName: company.name,
                                    photoUrl
                                  };
                                  setPaymentReceipts(prev => [...prev, newReceipt]);
                                  // Ajout traçabilité
                                  const traceEntry = {
                                    userId: auth.user.id,
                                    userName: auth.user.fullName,
                                    action: t('traceability.paymentReceiptCreated'),
                                    date: new Date().toISOString()
                                  };
                                  // Si une déclaration existe déjà, mettre à jour Firestore
                                  if (enRouteDeclaration) {
                                    await updateDeclaration(enRouteDeclaration.id, {
                                      ...enRouteDeclaration,
                                      paymentReceipts: [...(enRouteDeclaration.paymentReceipts || []), newReceipt],
                                      traceability: [...(enRouteDeclaration.traceability || []), traceEntry]
                                    });
                                  }
                                  setIsCameraModalOpen(false);
                                }}
                                onClose={() => setIsCameraModalOpen(false)}
                              />
                            </div>
                          </div>
                        )}
                        {/* Si on est en mode création initiale (en_route) */}
                        {!enRouteDeclaration ? (
                          <div className="flex flex-col gap-2">
                            <Button
                              onClick={handleCreateDeclaration}
                              className="flex-1 text-sm"
                              disabled={
                                !formData.year ||
                                !formData.month ||
                                !formData.programNumber ||
                                formData.programNumber.length !== 4
                              }
                            >
                              {t('forms.save')}
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1 text-sm"
                              onClick={() => {
                                setEnRouteDeclaration(null);
                                setIsCancelDialogOpen(true);
                                setPaymentReceipts([]);
                              }}
                            >
                              {t('forms.cancel')}
                            </Button>
                          </div>
                        ) : (
                          <>
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
                              <Button onClick={handleDeclareEnRoute} className="flex-1 text-sm bg-blue-600 text-white hover:bg-blue-700">
                                {t('declarations.declare') || 'Déclarer'}
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    className="flex-1 text-sm"
                                  >
                                    {t('forms.cancel')}
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>{t('declarations.confirmDeleteTitle') || 'Confirmer la suppression'}</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      {t('declarations.confirmDeleteDescription') || 'Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.'}
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                                    <AlertDialogAction
                                      onClick={async () => {
                                        if (enRouteDeclaration) {
                                          await deleteDeclaration(enRouteDeclaration.id);
                                          setEnRouteDeclaration(null);
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
                                        }
                                      }}
                                    >
                                      {t('forms.yes') || 'Oui'}
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </>
                        )}
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
                                    {/* Affiche Frais de Livraison uniquement si chauffeur externe */}
                                    {auth?.user?.employeeType === 'externe' && (
                                      <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.deliveryFees')}</TableHead>
                                    )}
                                    {/* Affiche Prime de route uniquement si chauffeur interne */}
                                    {auth?.user?.employeeType === 'interne' && (
                                      <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route' : t('declarations.primeDeRoute')}</TableHead>
                                    )}
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
                                      {/* Frais de Livraison uniquement pour externe */}
                                      {auth?.user?.employeeType === 'externe' && (
                                        <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                          {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                                        </TableCell>
                                      )}
                                      {/* Prime de route uniquement pour interne */}
                                      {auth?.user?.employeeType === 'interne' && (
                                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                                          {declaration.primeDeRoute ? (
                                            <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                                              {declaration.primeDeRoute.toFixed(2)} DZD
                                            </span>
                                          ) : '-'}
                                        </TableCell>
                                      )}
                                      <TableCell className="whitespace-nowrap">
                                        {getStatusBadge(declaration.status, declaration)}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        <div className="flex gap-1 sm:gap-2">
                                          {(declaration.status === 'en_cours' || declaration.status === 'en_route') && (
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
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('declarations.confirmDeleteTitle') || 'Confirmer la suppression'}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      {t('declarations.confirmDeleteDescription') || 'Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.'}
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                      onClick={async () => {
                                                        await deleteDeclaration(declaration.id);
                                                      }}
                                                    >
                                                      {t('forms.yes') || 'Oui'}
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
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
                <h1 className="text-2xl font-bold text-foreground mb-6">
                  {t('tabs.tracage') || 'Traçage'}
                </h1>
                <TracageSection 
                  gpsActive={gpsActive}
                  setGpsActive={setGpsActive}
                  userPosition={gpsPosition}
                  setUserPosition={setGpsPosition}
                />
              </div>
            )}
          </main>
        </div>
      ) : (
        <div className="flex min-h-[calc(100vh-4rem)] relative">
          {/* Badge En ligne en haut à droite, absolute, hors sidebar */}
          <div className="absolute top-0 right-0 m-2 z-10 flex items-center gap-2">
      {/* Notification Modal/Dropdown */}
      {showNotifications && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={() => setShowNotifications(false)}>
          <div className="bg-white rounded-lg shadow-lg p-4 max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-bold">Notifications</h2>
              <button className="text-gray-500 hover:text-gray-700" onClick={() => setShowNotifications(false)}>
                <span className="material-icons">close</span>
              </button>
            </div>
            {notifications.length === 0 ? (
              <div className="text-center text-muted-foreground py-4">Aucune notification</div>
            ) : (
              <ul className="divide-y divide-gray-200">
                {notifications.map((notif) => (
                  <li key={notif.id} className={`py-2 px-1 flex flex-col ${notif.read ? 'bg-gray-50' : 'bg-blue-50'}`}>
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-sm">{notif.message || notif.title || 'Notification'}</span>
                      {!notif.read && (
                        <button className="ml-2 px-2 py-1 text-xs bg-blue-600 text-white rounded" onClick={() => handleMarkAsRead(notif.id)}>Marquer comme lu</button>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 mt-1">{notif.createdAt ? new Date(notif.createdAt).toLocaleString() : ''}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
            <span
              className="flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700 shadow"
              title={isOnline ? 'Connecté au cloud' : 'Hors ligne'}
            >
              <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
              En ligne
            </span>
            {/* GPS Button (toujours visible, desktop et mobile) */}
            <Button
              type="button"
              className={
                `ml-2 flex items-center justify-center w-8 h-8 rounded-full border-2 transition-all ` +
                (gpsActive
                  ? 'bg-green-500 border-green-600 shadow-lg ring-2 ring-green-300 animate-pulse'
                  : 'bg-red-500 border-red-600')
              }
              style={{ boxShadow: gpsActive ? '0 0 8px 2px #22c55e' : 'none' }}
              title={gpsActive ? 'Désactiver le GPS' : 'Activer le GPS'}
              onClick={async e => {
                if (gpsActive) {
                  setShowGpsConfirm(true);
                } else {
                  const pos = await getCurrentPosition();
                  if (pos) {
                    setGpsPosition(pos);
                    setGpsActive(true);
                  } else {
                    setGpsActive(false);
                    setGpsPosition(null);
                    toast({ title: 'Accès à la position refusé ou indisponible', variant: 'destructive' });
                  }
                }
              }}
            >
              <span className="material-icons text-white text-lg">gps_fixed</span>
            </Button>
            {/* Confirmation dialog uniquement pour la désactivation */}
            <AlertDialog open={showGpsConfirm} onOpenChange={setShowGpsConfirm}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Désactiver le GPS ?</AlertDialogTitle>
                  <AlertDialogDescription>
                    Êtes-vous sûr de vouloir désactiver le GPS ?
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setShowGpsConfirm(false)}>Annuler</AlertDialogCancel>
                  <AlertDialogAction onClick={() => { setGpsActive(false); setGpsPosition(null); setShowGpsConfirm(false); }}>Désactiver</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
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
                    <CardHeader className="pb-3 flex flex-row items-start justify-between">
                      <CardTitle className="flex items-center gap-2 text-card-foreground text-lg">
                        <Plus className="h-4 w-4 sm:h-5 sm:w-5" />
                        {t('dashboard.newDeclaration')}
                      </CardTitle>
                      {/* Bouton En Panne en haut à droite desktop */}
                      {!isMobile && enRouteDeclaration && enRouteDeclaration.status === 'en_route' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex items-center gap-2" title={t('declarations.breakdownButton')}>
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              {t('declarations.breakdownButton')}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>{t('declarations.breakdown')}</AlertDialogTitle>
                              <AlertDialogDescription>
                                {t('declarations.breakdownConfirm') || 'Êtes-vous sûr de vouloir signaler une panne pour cette déclaration ? Cette action est irréversible.'}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={async () => {
                                  if (enRouteDeclaration) {
                                    const traceEntry = {
                                      userId: auth.user?.id || '',
                                      userName: auth.user?.fullName || auth.user?.username || '',
                                      action: 'Signalée en panne',
                                      date: new Date().toISOString(),
                                    };
                                    await updateDeclaration(enRouteDeclaration.id, {
                                      ...enRouteDeclaration,
                                      status: 'en_panne',
                                      traceability: [...(enRouteDeclaration.traceability || []), traceEntry],
                                    });
                                    setEnRouteDeclaration(null);
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
                                  }
                                }}
                              >
                                {t('forms.yes') || 'Oui'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </CardHeader>
                    <CardContent className="space-y-3 sm:space-y-4">
                      {!isCreating ? (
                        <Button onClick={() => setIsCreating(true)} className="w-full text-sm sm:text-base">
                          {t('dashboard.createNewDeclaration')}
                        </Button>
                      ) : enRouteDeclaration ? (
                        <div className="space-y-3 sm:space-y-4">
                          {/* Bandeau En panne au-dessus du formulaire si la déclaration est en panne (desktop) */}
                          {enRouteDeclaration.status === 'en_panne' && (
                            <div className="flex items-center gap-2 px-4 py-2 bg-red-100 border-b-2 border-red-500 text-red-700 font-semibold rounded-t-md mb-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-1.414 1.414A7.975 7.975 0 0012 6c-2.21 0-4.21.896-5.95 2.364l-1.414-1.414A9.969 9.969 0 0112 4c2.761 0 5.261 1.12 7.071 2.929zM4.222 19.778A9.969 9.969 0 0112 20c2.761 0 5.261-1.12 7.071-2.929l-1.414-1.414A7.975 7.975 0 0112 18c-2.21 0-4.21-.896-5.95-2.364l-1.414 1.414z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span>{t('declarations.breakdown')}</span>
                            </div>
                          )}
                          {/* Affichage identique à la saisie initiale, mais en lecture seule */}
                          <SimpleDeclarationNumberForm
                            initialYear={enRouteDeclaration.year}
                            initialMonth={enRouteDeclaration.month}
                            initialProgramNumber={enRouteDeclaration.programNumber}
                            readOnly={true}
                            onNumberChange={() => {}}
                            onComponentsChange={() => {}}
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
                            {/* Champ Frais de Livraison affiché uniquement pour chauffeur externe */}
                            {auth?.user?.employeeType === 'externe' && (
                              <>
                                <Label htmlFor="deliveryFees" className="text-foreground text-sm">{t('declarations.deliveryFees')}</Label>
                                <Input
                                  id="deliveryFees"
                                  type="number"
                                  value={formData.deliveryFees}
                                  onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
                                  className="bg-background border-border text-foreground text-sm w-full mt-1"
                                />
                              </>
                            )}
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
                            <Button onClick={handleDeclareEnRoute} className="flex-1 text-sm bg-blue-600 text-white hover:bg-blue-700">
                              {t('declarations.declare') || 'Déclarer'}
                            </Button>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  className="flex-1 sm:flex-none text-sm"
                                >
                                  {t('forms.cancel')}
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent className={isMobile ? 'max-w-xs w-[90vw] p-4 rounded-xl' : ''}>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>{t('declarations.confirmDeleteTitle') || 'Confirmer la suppression'}</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    {t('declarations.confirmDeleteDescription') || 'Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.'}
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={async () => {
                                      await deleteDeclaration(enRouteDeclaration.id);
                                      setEnRouteDeclaration(null);
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
                                    {t('forms.yes') || 'Oui'}
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ) : (
                        <div className="space-y-3 sm:space-y-4">
                          <SimpleDeclarationNumberForm
                            onNumberChange={handleNumberChange}
                            onComponentsChange={handleComponentsChange}
                          />
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
            )
          }
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
                      <div className="grid grid-cols-4 gap-2 sm:gap-4 text-center">
                        {/* En Route */}
                        <div className="p-3 sm:p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                          <div className="text-xl sm:text-2xl font-bold text-blue-700 dark:text-blue-400">
                            {chauffeurDeclarations.filter(d => d.status === 'en_route').length}
                          </div>
                          <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-300">{t('dashboard.onRoad')}</div>
                        </div>
                        {/* En Cours */}
                        <div className="p-3 sm:p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                          <div className="text-xl sm:text-2xl font-bold text-yellow-700 dark:text-yellow-400">
                            {chauffeurDeclarations.filter(d => d.status === 'en_cours').length}
                          </div>
                          <div className="text-xs sm:text-sm text-yellow-600 dark:text-yellow-300">{t('dashboard.pending')}</div>
                        </div>
                        {/* Validé */}
                        <div className="p-3 sm:p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                          <div className="text-xl sm:text-2xl font-bold text-green-700 dark:text-green-400">
                            {chauffeurDeclarations.filter(d => d.status === 'valide').length}
                          </div>
                          <div className="text-xs sm:text-sm text-green-600 dark:text-green-300">{t('dashboard.validated')}</div>
                        </div>
                        {/* Refusé */}
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
                                    {/* Affiche Frais de Livraison uniquement si chauffeur externe */}
                                    {auth?.user?.employeeType === 'externe' && (
                                      <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.deliveryFees')}</TableHead>
                                    )}
                                    {/* Affiche Prime de route uniquement si chauffeur interne */}
                                    {auth?.user?.employeeType === 'interne' && (
                                      <TableHead className="text-foreground text-xs sm:text-sm whitespace-nowrap">{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route' : t('declarations.primeDeRoute')}</TableHead>
                                    )}
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
                                      {/* Frais de Livraison uniquement pour externe */}
                                      {auth?.user?.employeeType === 'externe' && (
                                        <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                          {declaration.deliveryFees ? `${declaration.deliveryFees} DZD` : '-'}
                                        </TableCell>
                                      )}
                                      {/* Prime de route uniquement pour interne */}
                                      {auth?.user?.employeeType === 'interne' && (
                                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">
                                          {declaration.primeDeRoute ? (
                                            <span style={{ color: '#FFD700', fontWeight: 'bold' }}>
                                              {declaration.primeDeRoute.toFixed(2)} DZD
                                            </span>
                                          ) : '-'}
                                        </TableCell>
                                      )}
                                      <TableCell className="whitespace-nowrap">
                                        {getStatusBadge(declaration.status, declaration)}
                                      </TableCell>
                                      <TableCell className="text-foreground text-xs sm:text-sm whitespace-nowrap">
                                        {new Date(declaration.createdAt).toLocaleDateString('fr-FR')}
                                      </TableCell>
                                      <TableCell className="whitespace-nowrap">
                                        <div className="flex gap-1 sm:gap-2">
                                          {(declaration.status === 'en_cours' || declaration.status === 'en_route') && (
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
                                              <AlertDialog>
                                                <AlertDialogTrigger asChild>
                                                  <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 h-8 w-8 p-0"
                                                  >
                                                    <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
                                                  </Button>
                                                </AlertDialogTrigger>
                                                <AlertDialogContent>
                                                  <AlertDialogHeader>
                                                    <AlertDialogTitle>{t('declarations.confirmDeleteTitle') || 'Confirmer la suppression'}</AlertDialogTitle>
                                                    <AlertDialogDescription>
                                                      {t('declarations.confirmDeleteDescription') || 'Êtes-vous sûr de vouloir supprimer cette déclaration ? Cette action est irréversible.'}
                                                    </AlertDialogDescription>
                                                  </AlertDialogHeader>
                                                  <AlertDialogFooter>
                                                    <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
                                                    <AlertDialogAction
                                                      onClick={async () => {
                                                        await deleteDeclaration(declaration.id);
                                                      }}
                                                    >
                                                      {t('forms.yes') || 'Oui'}
                                                    </AlertDialogAction>
                                                  </AlertDialogFooter>
                                                </AlertDialogContent>
                                              </AlertDialog>
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
              <>
                {/* Show Tracage title above tabs in desktop mode only */}
                {!(settings?.viewMode === 'mobile') && (
                  <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                      {t('tabs.tracage') || 'Traçage'}
                    </h1>
                  </div>
                )}
                <TracageSection 
                  gpsActive={gpsActive}
                  setGpsActive={setGpsActive}
                  userPosition={gpsPosition}
                  setUserPosition={setGpsPosition}
                />
              </>
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

      {/* AlertDialog de confirmation d'annulation (mobile) */}
      <AlertDialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <AlertDialogContent className={isMobile ? 'max-w-xs w-[90vw] p-4 rounded-xl' : ''}>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('declarations.confirmCancelTitle') || 'Confirmer l’annulation'}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('declarations.confirmCancelDescription') || 'Êtes-vous sûr de vouloir annuler la création de cette déclaration ? Les informations saisies seront perdues.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('forms.no') || 'Non'}</AlertDialogCancel>
            <AlertDialogAction
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
                setIsCancelDialogOpen(false);
              }}
            >
              {t('forms.yes') || 'Oui'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog motif de refus */}
      <AlertDialog open={refusalDialogOpen} onOpenChange={setRefusalDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('dashboard.refused')}</AlertDialogTitle>
            <AlertDialogDescription>
              {refusalReasonLabel ? (
                <span className="text-base font-semibold text-red-700 dark:text-red-400">{refusalReasonLabel}</span>
              ) : (
                <span className="text-muted-foreground text-sm italic">{t('dashboard.selectRefusalReason') || 'Motif non renseigné'}</span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setRefusalDialogOpen(false)}>{t('forms.confirm') || 'Fermer'}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default ChauffeurDashboard;
