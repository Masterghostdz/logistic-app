import React, { useState, useEffect } from 'react';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from './ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { toast } from 'sonner';
import { MapPin, Truck, Plus, Building2, Edit, Trash2 } from 'lucide-react';
import OpenStreetMap from './OpenStreetMap';
import MobileOpenStreetMap from './MobileOpenStreetMap';
import { Warehouse, Chauffeur } from '../types';
import { useSharedData } from '../contexts/SharedDataContext';
import { useIsMobile } from '../hooks/use-mobile';
import PhoneNumbersField from './PhoneNumbersField';

const TracageSection = () => {
  const isMobile = useIsMobile();
  // Liste des sociétés synchronisées Firestore
  const [companies, setCompanies] = useState([]);
  useEffect(() => {
    let unsubscribe;
    const listen = async () => {
      const { listenCompanies } = await import('../services/companyService');
      unsubscribe = listenCompanies((cloudCompanies) => {
        setCompanies(cloudCompanies);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);
  const [warehouses, setWarehouses] = useState<Warehouse[]>([]);
  useEffect(() => {
    let unsubscribe;
    const listen = async () => {
      const { listenWarehouses } = await import('../services/warehouseService');
      unsubscribe = listenWarehouses((cloudWarehouses) => {
        setWarehouses(cloudWarehouses);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);


  // Synchronisation temps réel des chauffeurs depuis Firestore
  const [chauffeurs, setChauffeurs] = useState<Chauffeur[]>([]);
  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenChauffeurs } = await import('../services/chauffeurService');
      unsubscribe = listenChauffeurs((cloudChauffeurs) => {
        setChauffeurs(cloudChauffeurs);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Filtrer les chauffeurs en ligne (tracking actif, position valide, position récente < 5min)
  const now = Date.now();
  const ONLINE_TIMEOUT = 5 * 60 * 1000; // 5 minutes
  const onlineChauffeurs = chauffeurs.filter(c =>
    c.isTracking === true &&
    typeof c.latitude === 'number' && typeof c.longitude === 'number' &&
    !isNaN(c.latitude) && !isNaN(c.longitude) &&
    c.lastPositionAt && (now - new Date(c.lastPositionAt).getTime() < ONLINE_TIMEOUT)
  );

  const [showCreateWarehouse, setShowCreateWarehouse] = useState(false);
  const [editingWarehouse, setEditingWarehouse] = useState<Warehouse | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [warehouseToDelete, setWarehouseToDelete] = useState<Warehouse | null>(null);
  const [newWarehouse, setNewWarehouse] = useState({
    name: '',
    companyId: '',
    companyName: '',
    phone: [] as string[],
    address: '',
    lat: '',
    lng: ''
  });

  const handleCreateOrUpdateWarehouse = async (e: React.FormEvent) => {
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
    const warehouseData = {
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
    try {
      if (editingWarehouse) {
        const { updateWarehouse } = await import('../services/warehouseService');
        await updateWarehouse(editingWarehouse.id, warehouseData);
        toast.success('Entrepôt modifié avec succès');
        setEditingWarehouse(null);
      } else {
        const { addWarehouse } = await import('../services/warehouseService');
        await addWarehouse(warehouseData);
        toast.success('Entrepôt créé avec succès');
      }
      setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', lat: '', lng: '' });
      setShowCreateWarehouse(false);
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement de l'entrepôt");
    }
  };

  const handleEditWarehouse = (warehouse: Warehouse) => {
    setEditingWarehouse(warehouse);
    setShowCreateWarehouse(true);
    setNewWarehouse({
      name: warehouse.name,
      companyId: warehouse.companyId,
      companyName: warehouse.companyName,
      phone: warehouse.phone,
      address: warehouse.address,
      lat: warehouse.coordinates?.lat?.toString() || '',
      lng: warehouse.coordinates?.lng?.toString() || ''
    });
  };

  const handleDeleteWarehouse = (warehouse: Warehouse) => {
    setWarehouseToDelete(warehouse);
    setShowDeleteDialog(true);
  };

  const confirmDeleteWarehouse = async () => {
    if (!warehouseToDelete) return;
    try {
      const { deleteWarehouse } = await import('../services/warehouseService');
      await deleteWarehouse(warehouseToDelete.id);
      toast.success('Entrepôt supprimé');
    } catch (err) {
      toast.error('Erreur lors de la suppression');
    }
    setShowDeleteDialog(false);
    setWarehouseToDelete(null);
  };

  const handleCompanyChange = (companyId: string) => {
    const selectedCompany = companies.find(c => c.id === companyId);
    setNewWarehouse({
      ...newWarehouse,
      companyId,
      companyName: selectedCompany?.name || ''
    });
  };

  // Ne passer à la carte que les entrepôts avec coordonnées valides
  const validWarehouses = warehouses.filter(
    w => w.coordinates && typeof w.coordinates.lat === 'number' && typeof w.coordinates.lng === 'number' && !isNaN(w.coordinates.lat) && !isNaN(w.coordinates.lng)
  );

  return (
    <div className="space-y-6 p-2 md:p-6 max-w-full overflow-hidden">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold">Traçage</h2>
      </div>

      <Tabs defaultValue="entrepots" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="entrepots" className="flex items-center gap-2 text-xs md:text-sm">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Entrepôts</span>
            <span className="sm:hidden">Dépôts</span>
          </TabsTrigger>
          <TabsTrigger value="chauffeurs" className="flex items-center gap-2 text-xs md:text-sm">
            <Truck className="h-4 w-4" />
            Chauffeurs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="entrepots" className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <h3 className="text-base md:text-lg font-semibold">Gestion des Entrepôts</h3>
            <Button 
              onClick={() => setShowCreateWarehouse(!showCreateWarehouse)} 
              className="flex items-center gap-2 text-xs md:text-sm w-full sm:w-auto"
              size={isMobile ? "sm" : "default"}
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Créer un entrepôt</span>
              <span className="sm:hidden">Nouveau</span>
            </Button>
          </div>

          {(showCreateWarehouse || editingWarehouse) && (
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-base md:text-lg">{editingWarehouse ? 'Modifier l\'entrepôt' : 'Créer un nouvel entrepôt'}</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateOrUpdateWarehouse} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name" className="text-sm">Nom de l'entrepôt</Label>
                      <Input
                        id="name"
                        value={newWarehouse.name}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, name: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="company" className="text-sm">Société</Label>
                      <Select value={newWarehouse.companyId} onValueChange={handleCompanyChange} required>
                        <SelectTrigger className="text-sm">
                          <SelectValue placeholder="Sélectionner une société" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id} className="text-sm">
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="md:col-span-2">
                      <PhoneNumbersField
                        label="Numéros de téléphone"
                        phones={newWarehouse.phone}
                        onChange={(phones) => setNewWarehouse({ ...newWarehouse, phone: phones })}
                      />
                    </div>
                    <div className="md:col-span-2">
                      <Label htmlFor="address" className="text-sm">Adresse</Label>
                      <Input
                        id="address"
                        value={newWarehouse.address}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, address: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lat" className="text-sm">Latitude</Label>
                      <Input
                        id="lat"
                        type="number"
                        step="any"
                        value={newWarehouse.lat}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lat: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Label htmlFor="lng" className="text-sm">Longitude</Label>
                      <Input
                        id="lng"
                        type="number"
                        step="any"
                        value={newWarehouse.lng}
                        onChange={(e) => setNewWarehouse({ ...newWarehouse, lng: e.target.value })}
                        required
                        className="text-sm"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button type="submit" size={isMobile ? "sm" : "default"} className="text-sm">{editingWarehouse ? 'Enregistrer' : 'Créer'}</Button>
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => { setShowCreateWarehouse(false); setEditingWarehouse(null); setNewWarehouse({ name: '', companyId: '', companyName: '', phone: [], address: '', lat: '', lng: '' }); }}
                      size={isMobile ? "sm" : "default"}
                      className="text-sm"
                    >
                      Annuler
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
            <div className="space-y-4 order-2 lg:order-1">
              <h4 className="font-semibold text-sm md:text-base">Liste des Entrepôts</h4>
              <div className="max-h-80 md:max-h-96 overflow-y-auto space-y-3">
                {warehouses.map((warehouse) => (
                  <Card key={warehouse.id}>
                    <CardContent className="p-3 md:p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h5 className="font-semibold truncate text-sm md:text-base">{warehouse.name}</h5>
                          <p className="text-xs md:text-sm text-gray-600 truncate">{warehouse.companyName}</p>
                          <p className="text-xs md:text-sm text-gray-500 truncate">{warehouse.address}</p>
                          <div className="text-xs md:text-sm text-gray-500">
                            {warehouse.phone.map((phone, index) => (
                              <div key={index} className="truncate">{phone}</div>
                            ))}
                          </div>
                        </div>
                        <div className="flex flex-col gap-2 items-end">
                          <Badge variant="outline" className="bg-green-50 text-green-700 ml-2 flex-shrink-0 text-xs mb-1">
                            <MapPin className="h-3 w-3 mr-1" />
                            Actif
                          </Badge>
                          <div className="flex gap-2">
                            <Button size="icon" variant="outline" onClick={() => handleEditWarehouse(warehouse)} className="text-xs p-2" title="Modifier">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="destructive" onClick={() => handleDeleteWarehouse(warehouse)} className="text-xs p-2" title="Supprimer">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
      {/* Dialog de confirmation suppression */}
      {/* Dialog de confirmation suppression avec z-index élevé */}
      <div style={{ position: 'relative', zIndex: 9999 }}>
        <AlertDialog open={showDeleteDialog} onOpenChange={open => { if (!open) setShowDeleteDialog(false); }}>
          <AlertDialogContent style={{ zIndex: 99999 }}>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            </AlertDialogHeader>
            <div>Êtes-vous sûr de vouloir supprimer cet entrepôt ? Cette action est irréversible.</div>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setShowDeleteDialog(false)}>Annuler</AlertDialogCancel>
              <AlertDialogAction onClick={confirmDeleteWarehouse}>Supprimer</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
              </div>
            </div>
            
            <div className="min-h-0 order-1 lg:order-2">
              <h4 className="font-semibold mb-4 text-sm md:text-base">Carte des Entrepôts</h4>
              <div className="h-64 sm:h-80 lg:h-[500px] w-full">
                {isMobile ? (
                  <MobileOpenStreetMap 
                    warehouses={validWarehouses}
                    height="100%"
                  />
                ) : (
                  <OpenStreetMap 
                    warehouses={validWarehouses}
                    height="100%"
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="chauffeurs" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 lg:gap-6 h-80 lg:h-[500px]">
            {/* Liste des chauffeurs en ligne à gauche */}
            <div className="col-span-1 overflow-y-auto bg-white rounded-lg border p-2 shadow-sm">
              <h4 className="font-semibold mb-2 text-sm md:text-base flex items-center gap-2"><Truck className="h-4 w-4" /> Chauffeurs en ligne</h4>
              {onlineChauffeurs.length === 0 ? (
                <div className="text-gray-500 text-sm">Aucun chauffeur en ligne</div>
              ) : (
                <ul className="space-y-2">
                  {onlineChauffeurs.map((c) => (
                    <li key={c.id} className="flex flex-col border-b pb-2 last:border-b-0 last:pb-0">
                      <span className="font-medium text-sm">{c.fullName}</span>
                      <span className="text-xs text-gray-500">{c.vehicleType} • {c.phone.join(', ')}</span>
                      <span className="text-xs text-green-600">En ligne</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Carte des chauffeurs en ligne à droite */}
            <div className="col-span-1 lg:col-span-3">
              <div className="h-64 sm:h-80 lg:h-[500px] w-full">
                {isMobile ? (
                  <MobileOpenStreetMap 
                    chauffeurs={onlineChauffeurs}
                    height="100%"
                  />
                ) : (
                  <OpenStreetMap 
                    chauffeurs={onlineChauffeurs}
                    height="100%"
                  />
                )}
              </div>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TracageSection;
