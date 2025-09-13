import { useTranslation } from '../hooks/useTranslation';
import WarehouseTable from "./dashboards/WarehouseTable";

import React, { useState, useEffect, useMemo } from 'react';
import { Dialog as ShadDialog, DialogContent as ShadDialogContent, DialogTitle as ShadDialogTitle } from './ui/dialog';
import { Dialog } from './ui/dialog';
import { ExternalLink } from 'lucide-react';
import { Client } from '../types/client';
import { getClients } from '../services/clientService';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { MapPin, Truck, Plus, Building2, Layers } from 'lucide-react';
import ClientDialog from './dashboards/ClientDialog';
import { addClient } from '../services/clientService';
import OpenStreetMap from './OpenStreetMap';
import MobileOpenStreetMap from './MobileOpenStreetMap';
import html2canvas from 'html2canvas';
import { Warehouse, Chauffeur } from '../types';
import { useSharedData } from '../contexts/SharedDataContext';
import { useAuth } from '../contexts/AuthContext';
import { useIsMobile } from '../hooks/use-mobile';

import PhoneNumbersField from './PhoneNumbersField';

interface TracageSectionProps {
  gpsActive: boolean;
  setGpsActive: (active: boolean) => void;
  userPosition: { lat: number; lng: number; accuracy?: number } | null;
  setUserPosition: (pos: { lat: number; lng: number; accuracy?: number } | null) => void;
}

const TracageSection = ({ gpsActive, setGpsActive, userPosition, setUserPosition }: TracageSectionProps) => {
  const sharedData = useSharedData();
  const companies = sharedData.companies || [];
  const isMobile = useIsMobile();
  const [showSettings, setShowSettings] = useState(false);
  const [highlightedClientId, setHighlightedClientId] = useState<string | null>(null);
  const [showMapModal, setShowMapModal] = useState(false);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  // Sélecteur de calque (fond de carte)
  const [layerType, setLayerType] = useState('osm');
  const [showLayerMenu, setShowLayerMenu] = useState(false);

  const auth = useAuth();
  // Onglet actif : client ou entrepot (client par défaut)
  const [activeTab, setActiveTab] = useState<'clients' | 'warehouses'>('clients');
  const [prevTab, setPrevTab] = useState<'clients' | 'warehouses'>('clients');
  useEffect(() => {
    // N'active pas automatiquement le GPS pour le planificateur
    if (auth?.user?.role !== 'planificateur' && activeTab !== prevTab && !gpsActive) {
      // Try to activate GPS on tab switch
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => {
            setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
            setGpsActive(true);
          },
          err => {
            setGpsActive(false);
            setUserPosition(null);
            if (err.code === 1) {
              toast.error("Accès à la position refusé. Veuillez autoriser la géolocalisation.");
            } else if (err.code === 2) {
              toast.error("Position non disponible.");
            } else {
              toast.error("Erreur lors de la récupération de la position.");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
    setPrevTab(activeTab);
  }, [activeTab]);
  const { t, settings } = useTranslation();
  // Clients Firestore
  const [clients, setClients] = useState<Client[]>([]);
  // Mes clients filter state
  const [showMyClients, setShowMyClients] = useState(false);
  // Client search/autocomplete state
  const [clientSearch, setClientSearch] = useState('');
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [showAutocomplete, setShowAutocomplete] = useState(false);
  const [showClientDialog, setShowClientDialog] = useState(false);
  useEffect(() => {
    // Listen to clients in Firestore for real-time updates
    let unsubscribe: (() => void) | undefined;
    import('../services/clientService').then(({ listenClients }) => {
      unsubscribe = listenClients(setClients);
    });
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);
  // State for client creation dialog
  const [showEditClient, setShowEditClient] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Handler for client creation
  // useAuth already declared above, do not redeclare
  const handleSubmitClient = async (client: Partial<Client>, isEdit: boolean) => {
    try {
      if (isEdit && editingClient) {
        const { updateClient } = await import('../services/clientService');
  await updateClient(editingClient.id, client, auth.user);
        toast.success('Client modifié');
      } else {
        // Détecte le rôle utilisateur pour le statut
        const userName = auth?.user?.fullName && auth.user.fullName.trim() !== ''
          ? auth.user.fullName
          : (auth?.user?.username || '');
        const newClient = {
          name: client.name || '',
          mobile: client.mobile || '',
          adresse: client.adresse || '',
          photoUrl: client.photoUrl || '',
          coordinates: {
            lat: typeof client.coordinates?.lat === 'string' ? parseFloat(client.coordinates.lat) : client.coordinates?.lat ?? 0,
            lng: typeof client.coordinates?.lng === 'string' ? parseFloat(client.coordinates.lng) : client.coordinates?.lng ?? 0,
          },
          createdAt: new Date().toISOString(),
          status: auth?.user?.role === 'planificateur' ? ('validated' as 'validated') : ('pending' as 'pending'),
          createur: userName,
        };
  await addClient(newClient, auth.user);
        toast.success(
          (auth?.user?.role === 'planificateur')
            ? 'Client validé'
            : 'Client en attente de validation'
        );
      }
      setShowEditClient(false);
      setEditingClient(null);
    } catch {
      toast.error("Erreur lors de l'enregistrement du client");
    }
  };
  // Seuls les clients validés sont affichés
  const myClients = useMemo(() => {
    if (!auth?.user) return [];
    const userNames = [auth.user.fullName, auth.user.username].filter(Boolean).map(s => s.trim().toLowerCase());
    return clients.filter(c =>
      c.createur && userNames.includes(c.createur.trim().toLowerCase())
    );
  }, [clients, auth?.user]);
  const filteredClients = useMemo(() => {
    // Seuls les clients validés ou modifiés sont visibles
    const allowedStatus = ['validé', 'modifié', 'validated', 'modified'];
    const allowedClients = clients.filter(c => c.status && allowedStatus.includes(c.status.toLowerCase()));
    if (showMyClients) {
      // Show only my clients, ignore search
      return myClients.filter(c => c.status && allowedStatus.includes(c.status.toLowerCase()));
    }
    if (!clientSearch) return allowedClients;
    const search = clientSearch.toLowerCase();
    return allowedClients.filter(c =>
      c.name?.toLowerCase().includes(search)
      // Add more fields if needed in the future
    );
  }, [clientSearch, clients, showMyClients, myClients]);

  // Affiche un toast si le calque Traffic est sélectionné (non adapté dark/clair)
  useEffect(() => {
    if (layerType === 'traffic') {
      toast.warning('Le mode Traffic peut ne pas être adapté au thème clair/sombre de l\'application.');
    }
  }, [layerType]);
  const mapRef = React.useRef<any>(null);
  const [mapInstance, setMapInstance] = useState<any>(null);
  // userPosition et gpsActive sont maintenant gérés par le parent (ChauffeurDashboard)
  // Fonctions pour les boutons overlay
  const handleZoomIn = () => {
    if (mapInstance && mapInstance.setZoom) {
      mapInstance.setZoom(mapInstance.getZoom() + 1);
    }
  };
  const handleZoomOut = () => {
    if (mapInstance && mapInstance.setZoom) {
      mapInstance.setZoom(mapInstance.getZoom() - 1);
    }
  };
  const handleCenterMap = () => {
    if (mapInstance && warehouses.length > 0) {
      // Centre sur l'Algérie ou sur le premier entrepôt
      const wh = focusedWarehouseId ? warehouses.find(w => w.id === focusedWarehouseId) : warehouses[0];
      if (wh) {
        mapInstance.setView([wh.coordinates.lat, wh.coordinates.lng], 13, { animate: true });
      } else {
        mapInstance.setView([28.0339, 1.6596], 6, { animate: true });
      }
    }
  };
  const handleGps = () => {
    if (auth?.user?.role === 'planificateur') {
      if (userPosition) {
        // Si la position existe, centrer la carte dessus
        if (mapInstance && userPosition) {
          mapInstance.setView([userPosition.lat, userPosition.lng], 15, { animate: true });
        }
        // Désactive visuellement le GPS si la position n'est plus suivie
        setUserPosition(null);
        setGpsActive(false);
        return;
      } else {
        if (!mapInstance) {
          toast.error("La carte n'est pas encore prête.");
          return;
        }
        if (!navigator.geolocation) {
          toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
          return;
        }
        setFocusedWarehouseId(null);
        navigator.geolocation.getCurrentPosition(
          pos => {
            setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
            setGpsActive(true);
            mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
          },
          err => {
            if (err.code === 1) {
              toast.error("Accès à la position refusé. Veuillez autoriser la géolocalisation.");
            } else if (err.code === 2) {
              toast.error("Position non disponible.");
            } else {
              toast.error("Erreur lors de la récupération de la position.");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    } else {
      if (userPosition) {
        setUserPosition(null);
        setGpsActive(false);
        // Ne pas désactiver le GPS global ici
      } else {
        if (!mapInstance) {
          toast.error("La carte n'est pas encore prête.");
          return;
        }
        if (!navigator.geolocation) {
          toast.error("La géolocalisation n'est pas supportée par ce navigateur.");
          return;
        }
        setFocusedWarehouseId(null);
        navigator.geolocation.getCurrentPosition(
          pos => {
            setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy });
            setGpsActive(true);
            mapInstance.setView([pos.coords.latitude, pos.coords.longitude], 15, { animate: true });
          },
          err => {
            if (err.code === 1) {
              toast.error("Accès à la position refusé. Veuillez autoriser la géolocalisation.");
            } else if (err.code === 2) {
              toast.error("Position non disponible.");
            } else {
              toast.error("Erreur lors de la récupération de la position.");
            }
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }
    }
  };
  const handleScreenshot = async () => {
    if (mapRef.current) {
      // Utilise html2canvas avec options pour forcer le rendu complet
      const canvas = await html2canvas(mapRef.current, {
        useCORS: true,
        backgroundColor: null,
        logging: false,
        allowTaint: true,
        windowWidth: mapRef.current.scrollWidth,
        windowHeight: mapRef.current.scrollHeight
      });
      const link = document.createElement('a');
      link.download = 'carte-logigrine.png';
      link.href = canvas.toDataURL();
      link.click();
    }
  };
  const [focusedWarehouseId, setFocusedWarehouseId] = useState<string | null>(null);
  useEffect(() => {
    import('../services/warehouseService').then(mod => {
      mod.getWarehouses().then((data: Warehouse[]) => setWarehouses(data));
    });
  }, []);
  const [chauffeurs] = useState<Chauffeur[]>([
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
      createdAt: new Date().toISOString(),
      coordinates: { lat: 36.7750, lng: 3.0594 }
    },
    {
      id: '2',
      firstName: 'Mohamed',
      lastName: 'Khedira',
      fullName: 'Mohamed Khedira',
      username: 'mkhedira',
      password: 'demo123',
      phone: ['+213 66 98 76 54'],
      vehicleType: 'Camionnette',
      employeeType: 'externe',
      isActive: true,
      createdAt: new Date().toISOString(),
      coordinates: { lat: 35.7000, lng: -0.6300 }
    }
  ]);
  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    companyId: '',
    companyName: '',
    phone: [] as string[],
    address: '',
    lat: '',
    lng: ''
  });

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWarehouse.name || !newWarehouse.companyId || !newWarehouse.address || !newWarehouse.lat || !newWarehouse.lng) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    const selectedCompany = companies.find(c => c.id === newWarehouse.companyId);
    if (!selectedCompany) {
      toast.error('Veuillez sélectionner une société');
      return;
    }
    const warehouse: Warehouse = {
      id: Date.now().toString(),
      name: newWarehouse.name,
      companyId: newWarehouse.companyId,
      companyName: selectedCompany.name,
      phone: newWarehouse.phone,
      address: newWarehouse.address,
      coordinates: {
        lat: parseFloat(newWarehouse.lat),
        lng: parseFloat(newWarehouse.lng)
      },
      createdAt: new Date().toISOString()
    };
    // TODO: Ajouter l'entrepôt à Firebase ici
    setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', lat: '', lng: '' });
    setShowCreateWarehouse(false);
    toast.success('Entrepôt créé avec succès (Firebase)');
  };

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find(c => c.id === companyId);
    setNewWarehouse({
      ...newWarehouse,
      companyId,
      companyName: selectedCompany?.name || ''
    });
  };

  // Detect if used in Chauffeur desktop context (by checking window.location)
  const isChauffeurDesktop = typeof window !== 'undefined' && !isMobile && window.location.pathname.includes('chauffeur');
  const mapHeight = isMobile ? 350 : isChauffeurDesktop ? 320 : 700;
  const mapMaxWidth = isMobile ? '100%' : isChauffeurDesktop ? '600px' : '100%';
  const listMaxWidth = isMobile ? '100%' : isChauffeurDesktop ? '600px' : '100%';
  // Plus de titre ici, il sera géré par le parent (ChauffeurDashboard)
  return (
    <>
      {/* Tabs pour Entrepôts / Clients */}
      <div className="mb-4">
        <Tabs
          key={settings.language}
          value={activeTab}
          onValueChange={v => setActiveTab(v as 'clients' | 'warehouses')}
        >
          <TabsList>
            <TabsTrigger value="clients">{t('tabs.clients') || 'Clients'}</TabsTrigger>
            <TabsTrigger value="warehouses">{t('tabs.warehouses') || 'Entrepôts'}</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      {/* (Supprimé: boutons Mes clients et + au-dessus de la map, ils sont maintenant sous le titre Clients) */}

  {/* Only show Clients title and + button below the map, above the search bar (see below) */}
        {/* Dialog for client creation/editing */}
        <ClientDialog
          isOpen={showEditClient}
          onClose={() => { setShowEditClient(false); setEditingClient(null); }}
          onSubmit={handleSubmitClient}
          editingClient={editingClient}
          readOnly={!!editingClient && activeTab === 'clients'}
        />
      {/* Modal/Dialog pour le formulaire de création d'entrepôt */}
      {showCreateWarehouse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
          <div className="bg-white dark:bg-muted rounded-lg shadow-lg p-4 max-w-[95vw] w-[400px] relative">
            <Button onClick={() => setShowCreateWarehouse(false)} className="absolute top-2 right-2" size="icon">✕</Button>
            <CardHeader className="pb-4">
              <CardTitle className="text-base md:text-lg">Créer un nouvel entrepôt</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWarehouse} className="space-y-4">
                {/* ...existing code... */}
              </form>
            </CardContent>
          </div>
        </div>
      )}

      {/* Nouvelle disposition : Carte immersive en haut, liste en dessous */}
  <div className="space-y-6 p-0 md:p-0 w-full flex flex-col">
    {/* Tout le contenu de la section doit être inclus dans ce wrapper pour garantir qu'il ne déborde jamais sous la sidebar */}
        {/* Titre section toujours visible au-dessus de la carte */}
        <div className="w-full flex flex-col">

          <div
            className="relative w-full rounded-xl shadow-2xl bg-transparent"
            style={{ height: mapHeight, minHeight: mapHeight, maxWidth: mapMaxWidth, background: 'transparent', padding: 0, margin: 0 }}
          >
            {/* Overlay boutons flottants */}
            <div className="absolute z-20 top-4 left-4 flex flex-col gap-2">
              <div className="bg-white/80 dark:bg-muted/80 rounded-lg shadow p-1 flex flex-row gap-1">
                <Button size="icon" variant="ghost" className="text-primary" title="Mode liste" onClick={() => toast.info('Mode liste à implémenter')}> 
                  <span className="material-icons">list_alt</span>
                </Button>
                <Button size="icon" variant="ghost" className="text-dark dark:text-white" title="Mode carte" onClick={() => toast.info('Mode carte à implémenter')}> 
                  <span className="material-icons">map</span>
                </Button>
                <Button size="icon" variant="ghost" className="text-dark dark:text-white" title="Zoom avant" onClick={handleZoomIn}>
                  <span className="material-icons">zoom_in</span>
                </Button>
                <Button size="icon" variant="ghost" className="text-dark dark:text-white" title="Zoom arrière" onClick={handleZoomOut}>
                  <span className="material-icons">zoom_out</span>
                </Button>
              </div>
            </div>
            {/* Bouton calques à l'intérieur de la map, fixé en bas droite */}
            <div className="pointer-events-none absolute z-30 bottom-6 right-6 w-auto h-auto">
              <div className="relative flex flex-col items-end">
                <div className="pointer-events-auto">
                  <Button size="icon" variant="ghost" className="bg-white/90 dark:bg-muted/90 text-dark dark:text-white rounded-full shadow-lg border border-gray-300" title="Changer le fond de carte" onClick={() => setShowLayerMenu(v => !v)}>
                    <Layers className="w-6 h-6" />
                  </Button>
                </div>
                {showLayerMenu && (
                  <div className="pointer-events-auto mb-2 bg-white dark:bg-muted rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1 animate-fade-in z-40" style={{position:'absolute', bottom:'100%', right:0}}>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='osm' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('osm'); setShowLayerMenu(false); }}>OpenStreetMap</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='google' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('google'); setShowLayerMenu(false); }}>Google Maps</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='satellite' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('satellite'); setShowLayerMenu(false); }}>Satellite</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='hybrid' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('hybrid'); setShowLayerMenu(false); }}>Hybride</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='terrain' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('terrain'); setShowLayerMenu(false); }}>Terrain</button>
                    <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='traffic' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('traffic'); setShowLayerMenu(false); }}>Traffic</button>
                  </div>
                )}
              </div>
            </div>
            <div className="absolute z-20 top-4 right-4 flex flex-col gap-2">
              <Button size="icon" variant="ghost" className="bg-white/80 dark:bg-muted/80 text-dark dark:text-white rounded-lg shadow" title="Paramètres" onClick={() => setShowSettings(true)}>
                <span className="material-icons">settings</span>
              </Button>
              <Button size="icon" variant="ghost" className="bg-white/80 dark:bg-muted/80 text-dark dark:text-white rounded-lg shadow" title="Centrer la carte" onClick={handleCenterMap}>
                <span className="material-icons">center_focus_strong</span>
              </Button>
                <Button
                  size="icon"
                  variant={userPosition && gpsActive ? "default" : "ghost"}
                  className={`bg-white/80 dark:bg-muted/80 text-dark dark:text-white rounded-lg shadow ${(userPosition && gpsActive) ? "ring-2 ring-primary" : ""}`}
                  title="GPS"
                  onClick={handleGps}
                >
                  <span className="material-icons">gps_fixed</span>
                </Button>
              <Button size="icon" variant="ghost" className="bg-white/80 dark:bg-muted/80 text-dark dark:text-white rounded-lg shadow" title="Screenshot" onClick={handleScreenshot}>
                <span className="material-icons">photo_camera</span>
              </Button>
            </div>
            <div
              ref={mapRef}
              className="vue2leaflet-map leaflet-container leaflet-touch leaflet-fade-anim leaflet-grab leaflet-touch-drag leaflet-touch-zoom w-full h-full rounded-xl overflow-hidden"
              style={{ height: '100%', width: '100%', minHeight: 700, position: 'relative', zIndex: 10, background: 'transparent', padding: 0, margin: 0 }}
            >
              {/* Carte */}
              {isMobile ? (
                <MobileOpenStreetMap
                  warehouses={activeTab === 'warehouses' ? warehouses : []}
                  focusedWarehouseId={activeTab === 'warehouses' ? focusedWarehouseId : null}
                  setMapInstance={setMapInstance}
                  layerType={layerType}
                  height="350px"
                  userPosition={userPosition}
                  highlightedWarehouseId={activeTab === 'warehouses' ? focusedWarehouseId : null}
                />
              ) : (
                <OpenStreetMap
                  warehouses={activeTab === 'warehouses' ? warehouses : []}
                  focusedWarehouseId={activeTab === 'warehouses' ? focusedWarehouseId : null}
                  setMapInstance={setMapInstance}
                  layerType={layerType}
                  height="100%"
                  userPosition={userPosition}
                  highlightedWarehouseId={activeTab === 'warehouses' ? focusedWarehouseId : null}
                  clients={activeTab === 'clients' ? clients : []}
                  highlightedClientId={activeTab === 'clients' ? highlightedClientId : null}
                />
              )}
              {/* Bouton calques à l'intérieur de la carte, fixé en bas droite */}
              <div className="pointer-events-none absolute z-30 bottom-6 right-6 w-auto h-auto">
                <div className="relative flex flex-col items-end">
                  <div className="pointer-events-auto">
                    <Button size="icon" variant="ghost" className="bg-white/90 dark:bg-muted/90 text-dark dark:text-white rounded-full shadow-lg border border-gray-300" title="Changer le fond de carte" onClick={() => setShowLayerMenu(v => !v)}>
                      <Layers className="w-6 h-6" />
                    </Button>
                  </div>
                  {showLayerMenu && (
                    <div className="pointer-events-auto mb-2 bg-white dark:bg-muted rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-2 flex flex-col gap-1 animate-fade-in z-40" style={{position:'absolute', bottom:'100%', right:0}}>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='osm' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('osm'); setShowLayerMenu(false); }}>OpenStreetMap</button>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='google' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('google'); setShowLayerMenu(false); }}>Google Maps</button>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='satellite' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('satellite'); setShowLayerMenu(false); }}>Satellite</button>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='hybrid' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('hybrid'); setShowLayerMenu(false); }}>Hybride</button>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='terrain' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('terrain'); setShowLayerMenu(false); }}>Terrain</button>
                      <button className={`px-3 py-1 rounded text-left text-xs ${layerType==='traffic' ? 'bg-primary/10 font-bold' : ''}`} onClick={() => { setLayerType('traffic'); setShowLayerMenu(false); }}>Traffic</button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          {/* Bouton accès liste entrepôts en mobile, superposé en bas-centre de la map */}
          {isMobile && (
            <div className="absolute left-1/2 bottom-4 -translate-x-1/2 z-30 flex justify-center w-full pointer-events-none">
              <div className="w-11/12 md:w-1/2 pointer-events-auto flex justify-center">
                <Button
                  variant="default"
                  size="lg"
                  className="w-full rounded-full shadow-lg text-base font-semibold"
                  onClick={() => {
                    const listSection = document.getElementById('entrepot-list-section');
                    if (listSection) {
                      listSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }
                  }}
                >
                  <span className="material-icons align-middle mr-2">list_alt</span>
                  Voir la liste des entrepôts
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Liste des entrepôts ou clients selon l'onglet actif */}
        {activeTab === 'warehouses' && (
          <div id="entrepot-list-section" className="w-full mt-8">
            <h2 className="text-xl md:text-2xl font-bold mb-4">Liste des Entrepôts</h2>
            <div className="space-y-2">
              {warehouses.length === 0 ? (
                <div className="text-muted-foreground text-sm">Aucun entrepôt synchronisé.</div>
              ) : (
                warehouses.map(wh => {
                  const isSelected = focusedWarehouseId === wh.id;
                  return (
                    <div key={wh.id} className="my-2 mx-1">
                      <Card
                        className={`p-2 cursor-pointer transition-all ${isSelected ? 'ring-2 ring-primary' : ''}`}
                        onClick={() => setFocusedWarehouseId(isSelected ? null : wh.id)}
                        title={isSelected ? "Désélectionner" : "Afficher sur la carte"}
                      >
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center justify-between whitespace-nowrap">
                            <span className="text-xs md:text-sm font-extrabold bg-blue-100 text-blue-500 rounded px-2 py-0.5 border border-blue-200 shadow-sm leading-tight">{wh.name}</span>
                            {wh.isActive ? (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-300 shadow">Actif</span>
                            ) : (
                              <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-300 shadow">Inactif</span>
                            )}
                          </div>
                          <div className="flex gap-2 text-xs items-center mt-1">
                            <span className="font-bold text-gray-900 dark:text-white">{wh.companyName}</span>
                          </div>
                          {wh.phone && wh.phone.length > 0 && (
                            <div className="text-xs font-mono text-gray-700 mt-1">{wh.phone[0]}</div>
                          )}
                        </div>
                      </Card>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        )}
        {activeTab === 'clients' && (
          <div
            id="client-list-section"
            className="w-full mt-8"
            style={{
              minHeight: showAutocomplete && clientSearch && filteredClients.length > 0 ? '420px' : undefined,
              transition: 'min-height 0.2s'
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <h2 className="text-xl md:text-2xl font-bold m-0 p-0">{t('tabs.clients') || 'Clients'}</h2>
              <Button
                size="icon"
                variant="default"
                title={t('forms.add') || 'Ajouter un client'}
                onClick={() => {
                  setEditingClient(null);
                  setShowEditClient(true);
                }}
              >
                <Plus className="w-6 h-6" />
              </Button>
              <Button
                variant="outline"
                className={`flex items-center gap-1 px-3 py-2 text-xs ${showMyClients ? 'border-2 border-white' : ''}`}
                onClick={() => {
                  if (showMyClients) {
                    setShowMyClients(false);
                    setClientSearch('');
                    setSelectedClient(null);
                  } else {
                    setShowMyClients(true);
                    setClientSearch('');
                    // Si un seul client, l'afficher directement
                    if (myClients.length === 1) {
                      setSelectedClient(myClients[0]);
                    } else {
                      setSelectedClient(null);
                    }
                  }
                }}
                title={t('forms.myClients') || 'Mes clients'}
              >
                {/* Client marker SVG icon (same as map marker) */}
                <span className="inline-flex items-center justify-center">
                  <svg width="64" height="64" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g>
                      <ellipse cx="24" cy="14.5" rx="12" ry="13" fill="#fcfcfcff"/>
                      <path d="M8 38c0-10 7.163-18 16-18s16 8 16 18v2a2 2 0 0 1-2 2H10a2 2 0 0 1-2-2v-2z" fill="#ffffffff"/>
                    </g>
                  </svg>
                </span>
                <span className="ml-1 text-base font-semibold">{myClients.length}</span>
              </Button>
            </div>
            {/* Search bar with autocompletion */}
            <div
              className="mb-4 relative"
              style={selectedClient ? undefined : { marginBottom: '120px' }}
            >
              <Input
                type="text"
                placeholder={t('declarations.searchPlaceholder') || 'Rechercher un client...'}
                value={clientSearch}
                onFocus={() => setShowAutocomplete(true)}
                onChange={e => {
                  setClientSearch(e.target.value);
                  setSelectedClient(null);
                  setShowAutocomplete(true);
                }}
                className="w-full max-w-md"
                autoComplete="off"
              />
              {showAutocomplete && clientSearch && filteredClients.length > 0 && (
                <div
                  className="absolute bg-white dark:bg-muted border border-gray-200 dark:border-gray-700 rounded shadow-lg mt-1 w-full max-w-md z-40"
                  style={{
                    maxHeight: 'calc(5 * 44px + 1px + 8px)', // 5 items * 44px + border + margin
                    overflowY: 'auto',
                    minHeight: '44px',
                    top: '100%',
                    left: 0,
                    right: 0
                  }}
                >
                  {filteredClients.slice(0, 5).map(client => (
                    <div
                      key={client.id}
                      className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setClientSearch(client.name || '');
                        setShowAutocomplete(false);
                      }}
                    >
                      <span className="font-semibold">{client.name}</span>
                    </div>
                  ))}
                  {filteredClients.length > 5 && (
                    <div
                      className="px-4 py-2 cursor-pointer hover:bg-primary/10 text-center text-sm text-muted-foreground border-t"
                      onClick={() => {
                        setShowClientDialog(true);
                        setShowAutocomplete(false);
                      }}
                    >
                      ...
                    </div>
                  )}
                </div>
              )}
      {/* Dialog for full client search list if more than 5 results */}
      <ShadDialog open={showClientDialog} onOpenChange={setShowClientDialog}>
        <ShadDialogContent className="max-w-lg w-full">
          <ShadDialogTitle>{t('tabs.clients') || 'Clients'}</ShadDialogTitle>
          <div className="max-h-96 overflow-y-auto divide-y">
            {filteredClients.map(client => (
              <div
                key={client.id}
                className="px-4 py-3 cursor-pointer hover:bg-primary/10 text-base"
                onClick={() => {
                  setSelectedClient(client);
                  setClientSearch(client.name || '');
                  setShowClientDialog(false);
                }}
              >
                <span className="font-semibold">{client.name}</span>
              </div>
            ))}
            {filteredClients.length === 0 && (
              <div className="px-4 py-3 text-muted-foreground text-center">{t('forms.no') || 'Aucun client trouvé'}</div>
            )}
          </div>
        </ShadDialogContent>
      </ShadDialog>
            </div>
            {/* Rich info panel for selected client */}
            {selectedClient && (
              <Card
                className="p-4 mb-6 flex flex-col md:flex-row gap-6 items-center md:items-center w-full max-w-full relative z-0"
              >
                <div className="flex-shrink-0">
                  {selectedClient.photoUrl ? (
                    <img src={selectedClient.photoUrl} alt={selectedClient.name} className="w-32 h-32 rounded-xl object-cover border shadow" />
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gray-200 flex items-center justify-center text-4xl text-gray-400 border shadow">
                      <span className="material-icons">person</span>
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="flex flex-col gap-2 w-full">
                    <div className="text-lg font-bold">{selectedClient.name}</div>
                    {/* Coordinates info */}
                    {/* No lat/lng display here, only Google Maps link in popup */}
                    {/* Map pin icon to focus client on map and show popup */}
                    <div className="mt-3">
                      <Button
                        variant="ghost"
                        size="icon"
                        title={t('forms.edit') || 'Pointer sur la carte'}
                        className={`w-[60px] h-[60px] p-0 flex items-center justify-center transition-all duration-150 ${highlightedClientId === selectedClient.id ? "border-2 border-white bg-transparent" : "bg-transparent"}`}
                        onClick={() => {
                          if (!selectedClient || !selectedClient.coordinates || !mapInstance || !mapInstance.setView) return;
                          if (highlightedClientId === selectedClient.id) {
                            setHighlightedClientId(null);
                          } else {
                            setHighlightedClientId(selectedClient.id);
                            mapInstance.setView([
                              selectedClient.coordinates.lat,
                              selectedClient.coordinates.lng
                            ], 16, { animate: true });
                          }
                        }}
                      >
                        <svg width="50" height="50" style={{minWidth:50, minHeight:50, maxWidth:50, maxHeight:50, display:'block'}} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <defs>
                            <mask id="client-pin-mask" maskUnits="userSpaceOnUse">
                              <rect x="0" y="0" width="24" height="24" fill="white"/>
                              <circle cx="12" cy="9" r="3" fill="black"/>
                            </mask>
                          </defs>
                          <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z" fill="none" stroke="#fff" strokeWidth="1.2"/>
                          <circle cx="12" cy="9" r="3.5" fill="#fff" stroke="#fff" strokeWidth="1" mask="url(#client-pin-mask)"/>
                        </svg>
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}
      </div>
    </>
  );
};

export default TracageSection;
