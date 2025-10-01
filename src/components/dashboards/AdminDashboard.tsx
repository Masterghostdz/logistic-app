import { useAuth } from '../../contexts/AuthContext';
import { AlertDialog, AlertDialogContent, AlertDialogHeader, AlertDialogTitle, AlertDialogFooter, AlertDialogCancel, AlertDialogAction } from '../ui/alert-dialog';

import React, { useState, useEffect } from 'react';
import AdminSidebar from './AdminSidebar';
import { useSettings } from '../../contexts/SettingsContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge, onlineBadgeClass, onlineBadgeInline } from '../ui/badge';
import useTableZoom from '../../hooks/useTableZoom';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { toast } from 'sonner';
import { 
  Users, 
  Building2, 
  Truck, 
  Plus, 
  Edit, 
  Trash2, 
  Settings, 
  ClipboardList,
  Key
} from 'lucide-react';
import { User as UserType, Company, VehicleType } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import { demoAccountsConfig } from '../../config/demoAccounts';
import Header from '../Header';
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import ProfilePage from '../ProfilePage';
import PhoneNumbersField from '../PhoneNumbersField';
import PasswordField from '../PasswordField';
import { simpleHash } from '../../utils/authUtils';
import RefusalReasonsConfig from '../admin/RefusalReasonsConfig';
import { db } from '../../services/firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';
import { useTranslation } from '../../hooks/useTranslation';

const zoomLevels = {
  '40': 0.75,
  '50': 0.80,
  '60': 0.85,
  '70': 0.90,
  '80': 0.95,
  '90': 1.0,
  '100': 1.05
};

const AdminDashboard = () => {
  const { t } = useTranslation();
  const {
    settings,
    updateSettings,
    setHeartbeatOnlineInterval,
    setHeartbeatGpsInterval,
    setHeartbeatPositionInterval,
    setHeartbeatOnlineEnabled,
    setHeartbeatOnlineImmediate,
    setHeartbeatGpsEnabled,
    setHeartbeatGpsImmediate,
    setHeartbeatPositionEnabled,
    setHeartbeatPositionImmediate,
    setGpsActivationRequestEnabled
  } = useSettings();
  // Heartbeat Firestore: met à jour lastOnline toutes les 60s
  const auth = useAuth();
  useEffect(() => {
    if (!auth?.user?.id) return;
    const userRef = doc(db, 'users', auth.user.id);
    const interval = setInterval(() => {
      updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
    }, 60000);
    updateDoc(userRef, { lastOnline: Date.now(), isOnline: true });
    return () => clearInterval(interval);
  }, [auth?.user?.id]);
  const [userTableFontSize, setUserTableFontSize] = useState(() => localStorage.getItem('userTableFontSize') || '80');
  const { localFontSize: userLocalFontSize, setLocalFontSize: setUserLocalFontSize, fontSizeStyle: userFontSizeStyle, rowHeight: userRowHeight } = useTableZoom(userTableFontSize as any);
  const [companyTableFontSize, setCompanyTableFontSize] = useState(() => localStorage.getItem('companyTableFontSize') || '80');
  const [vehicleTypeTableFontSize, setVehicleTypeTableFontSize] = useState(() => localStorage.getItem('vehicleTypeTableFontSize') || '80');
  const { localFontSize: vehicleTypeLocalFontSize, setLocalFontSize: setVehicleTypeLocalFontSize, fontSizeStyle: vehicleTypeFontSizeStyle, rowHeight: vehicleTypeRowHeight, iconSize: vehicleTypeIconSize } = useTableZoom(vehicleTypeTableFontSize as any);

  // Enregistre le zoom choisi dans le localStorage
  const handleUserTableZoom = (value) => {
    setUserTableFontSize(value);
    localStorage.setItem('userTableFontSize', value);
    // Also update the hook's local font size so consumers of useTableZoom react immediately
    try {
      // setUserLocalFontSize comes from useTableZoom(...) above
      setUserLocalFontSize?.(value as any);
    } catch (e) {
      // noop if unavailable for some reason
    }
  };
  const handleCompanyTableZoom = (value) => {
    setCompanyTableFontSize(value);
    localStorage.setItem('companyTableFontSize', value);
  };
  const handleVehicleTypeTableZoom = (value) => {
    setVehicleTypeTableFontSize(value);
    localStorage.setItem('vehicleTypeTableFontSize', value);
  };
  // const {
  //   updateSettings,
  //   setHeartbeatOnlineInterval,
  //   setHeartbeatGpsInterval,
  //   setHeartbeatPositionInterval,
  //   setHeartbeatOnlineEnabled,
  //   setHeartbeatOnlineImmediate,
  //   setHeartbeatGpsEnabled,
  //   setHeartbeatGpsImmediate,
  //   setHeartbeatPositionEnabled,
  //   setHeartbeatPositionImmediate,
  //   setGpsActivationRequestEnabled
  // } = useSettings();
  const viewMode = settings.viewMode || 'desktop';
  const [activeTab, setActiveTab] = useState('dashboard');
  // --- Synchronisation Firestore pour les sociétés ---
  const [companies, setCompanies] = useState<Company[]>([]);
  useEffect(() => {
    let unsubscribe;
    const listen = async () => {
      const { listenCompanies } = await import('../../services/companyService');
      unsubscribe = listenCompanies((cloudCompanies) => {
        setCompanies(cloudCompanies);
      });
    };
    listen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);

  // --- Synchronisation Firestore pour les types de véhicules ---
  const [vehicleTypes, setVehicleTypes] = useState<VehicleType[]>([]);
  useEffect(() => {
    let unsubscribe;
    const listen = async () => {
      const { listenVehicleTypes } = await import('../../services/vehicleTypeService');
      unsubscribe = listenVehicleTypes((cloudVehicleTypes) => {
        setVehicleTypes(cloudVehicleTypes);
      });
    };
    listen();
    return () => { if (unsubscribe) unsubscribe(); };
  }, []);
  
  // Synchronisation temps réel avec Firestore
  const [users, setUsers] = useState<(UserType & { password?: string; isOnline?: boolean })[]>([]);

  const { isOnline } = useOnlineStatus();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    const listen = async () => {
      const { listenUsers } = await import('../../services/userService');
      unsubscribe = listenUsers((cloudUsers) => {
        setUsers(cloudUsers);
      });
    };
    listen();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const [showCreateUser, setShowCreateUser] = useState(false);
  const [showCreateCompany, setShowCreateCompany] = useState(false);
  const [showCreateVehicleType, setShowCreateVehicleType] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);
  const [editingVehicleType, setEditingVehicleType] = useState<VehicleType | null>(null);
  const [selectedUserForPassword, setSelectedUserForPassword] = useState<string | null>(null);

  const [newUser, setNewUser] = useState({
    username: '',
    role: 'chauffeur' as UserType['role'],
    firstName: '',
    lastName: '',
    phone: [] as string[],
    password: ''
  });

  const [newCompany, setNewCompany] = useState({
    name: '',
    address: '',
    phone: [] as string[],
    email: ''
  });

  const [newVehicleType, setNewVehicleType] = useState({
    name: '',
    primeKilometrique: ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const handleCreateUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.username || !newUser.firstName || !newUser.lastName) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const saveUserToCloud = async () => {
      try {
        const { addUser, updateUser } = await import('../../services/userService');
        const { simpleHash } = await import('../../utils/authUtils');
        let userToSave: {
          username: string;
          role: UserType['role'];
          firstName: string;
          lastName: string;
          fullName: string;
          phone: string[];
          createdAt: string;
          isActive: boolean;
          salt?: string;
          passwordHash?: string;
        } = {
          username: newUser.username,
          role: newUser.role,
          firstName: newUser.firstName,
          lastName: newUser.lastName,
          fullName: `${newUser.firstName} ${newUser.lastName}`,
          phone: newUser.phone,
          createdAt: new Date().toISOString(),
          isActive: true
        };
        // Si mot de passe rempli, on hash et ajoute
        if (newUser.password && newUser.password.length >= 6) {
          const salt = 'logigrine2025';
          const passwordHash = await simpleHash(newUser.password, salt);
          userToSave = { ...userToSave, salt, passwordHash };
        }
        if (editingUser) {
          // Modification utilisateur existant
          await updateUser(editingUser.id, userToSave);
          toast.success('Utilisateur modifié dans le cloud');
        } else {
          // Création nouvel utilisateur
          const userDoc = await addUser(userToSave);
          toast.success('Utilisateur créé dans le cloud');
          // Synchronisation dans la collection chauffeurs si role chauffeur
          if (userToSave.role === 'chauffeur') {
            const { addChauffeur } = await import('../../services/chauffeurService');
            await addChauffeur({
              id: userDoc.id || Date.now().toString(),
              firstName: userToSave.firstName,
              lastName: userToSave.lastName,
              fullName: userToSave.fullName,
              username: userToSave.username,
              password: userToSave.passwordHash || '',
              phone: userToSave.phone,
              vehicleType: '',
              employeeType: 'interne',
              isActive: true,
              createdAt: userToSave.createdAt
            });
          }
        }
      } catch (err) {
        toast.error('Erreur lors de la synchronisation avec le cloud');
      }
    };

    saveUserToCloud();

    setNewUser({
      username: '',
      role: 'chauffeur',
      firstName: '',
      lastName: '',
      phone: [],
      password: ''
    });
    setEditingUser(null);
    setShowCreateUser(false);
  };

  const handleCreateCompany = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.name) {
      toast.error('Le nom de la société est obligatoire');
      return;
    }
    const { addCompany, updateCompany } = await import('../../services/companyService');
    if (editingCompany) {
      const updatedCompany = {
        ...editingCompany,
        name: newCompany.name,
        address: newCompany.address,
        phone: newCompany.phone,
        email: newCompany.email
      };
      await updateCompany(editingCompany.id, updatedCompany);
      setEditingCompany(null);
      toast.success('Société modifiée et synchronisée');
    } else {
      const company = {
        name: newCompany.name,
        address: newCompany.address,
        phone: newCompany.phone,
        email: newCompany.email,
        createdAt: new Date().toISOString()
      };
      await addCompany(company);
      toast.success('Société créée et synchronisée');
    }
    setNewCompany({ name: '', address: '', phone: [], email: '' });
    setShowCreateCompany(false);
  };

  const handleCreateVehicleType = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newVehicleType.name) {
      toast.error('Le nom du type de véhicule est obligatoire');
      return;
    }
    if (newVehicleType.primeKilometrique === '' || isNaN(Number(newVehicleType.primeKilometrique))) {
      toast.error('La prime kilométrique est obligatoire et doit être un nombre');
      return;
    }
    const { addVehicleType, updateVehicleType } = await import('../../services/vehicleTypeService');
    if (editingVehicleType) {
      const updatedVehicleType = {
        ...editingVehicleType,
        name: newVehicleType.name,
        primeKilometrique: Number(newVehicleType.primeKilometrique)
      };
      await updateVehicleType(editingVehicleType.id, updatedVehicleType);
      setEditingVehicleType(null);
      toast.success('Type de véhicule modifié et synchronisé');
    } else {
      const vehicleType = {
        name: newVehicleType.name,
        primeKilometrique: Number(newVehicleType.primeKilometrique),
        createdAt: new Date().toISOString()
      };
      await addVehicleType(vehicleType);
      toast.success('Type de véhicule créé et synchronisé');
    }
    setNewVehicleType({ name: '', primeKilometrique: '' });
    setShowCreateVehicleType(false);
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    if (selectedUserForPassword) {
      const updatedUsers = users.map(user => 
        user.id === selectedUserForPassword 
          ? { ...user, password: passwordData.newPassword }
          : user
      );
      
      setUsers(updatedUsers);
      toast.success('Mot de passe modifié avec succès');
      
      setPasswordData({ newPassword: '', confirmPassword: '' });
      setSelectedUserForPassword(null);
      setShowChangePassword(false);
    }
  };

  const handleEditUser = (user: UserType) => {
    setEditingUser(user);
    setNewUser({
      username: user.username,
      role: user.role,
      firstName: user.firstName,
      lastName: user.lastName,
      phone: user.phone || [],
      password: ''
    });
    setShowCreateUser(true);
  };

  const handleEditCompany = (company: Company) => {
    setEditingCompany(company);
    setNewCompany({
      name: company.name,
      address: company.address || '',
      phone: company.phone || [],
      email: company.email || ''
    });
    setShowCreateCompany(true);
  };

  const handleEditVehicleType = (vehicleType: VehicleType) => {
    setEditingVehicleType(vehicleType);
    setNewVehicleType({
      name: vehicleType.name,
      primeKilometrique: vehicleType.primeKilometrique?.toString() ?? ''
    });
    setShowCreateVehicleType(true);
  };

  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const handleDeleteUser = (id: string) => {
    setUserToDelete(id);
  };
  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    try {
      const { deleteUser } = await import('../../services/userService');
      await deleteUser(userToDelete);
      toast.success('Utilisateur supprimé du cloud');
    } catch (err) {
      toast.error('Erreur lors de la suppression sur le cloud');
    }
    setUserToDelete(null);
  };

  const handleDeleteCompany = async (id: string) => {
    const { deleteCompany } = await import('../../services/companyService');
    await deleteCompany(id);
    toast.success('Société supprimée et synchronisée');
  };

  const handleDeleteVehicleType = async (id: string) => {
    const { deleteVehicleType } = await import('../../services/vehicleTypeService');
    await deleteVehicleType(id);
    toast.success('Type de véhicule supprimé et synchronisé');
  };

  const handleProfileClick = () => {
    setActiveTab('profile');
  };

  const openChangePasswordDialog = (userId: string) => {
    setSelectedUserForPassword(userId);
    setShowChangePassword(true);
  };

  const { badgeClass, badgeStyle } = useTableZoom();

  const getRoleBadge = (role: string) => {
    // Harmonisation avec Header : couleurs et border identiques
    const roleColors = {
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800',
      planificateur: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      caissier: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800',
      chauffeur: 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800',
    };
    const roleLabels = {
      admin: t('roles.admin') || 'Administrateur',
      planificateur: t('roles.planificateur') || 'Planificateur',
      caissier: t('roles.caissier') || 'Caissier',
      chauffeur: t('roles.chauffeur') || 'Chauffeur',
    };
    const label = t(`roles.${role}`) || roleLabels[role as keyof typeof roleLabels] || role;
    return (
      <Badge
        className={`${badgeClass} text-xs rounded-full font-semibold border ${roleColors[role as keyof typeof roleColors] || 'bg-muted text-muted-foreground border-border'}`}
        style={{ minWidth: 90, textAlign: 'center', letterSpacing: 0.2, ...(badgeStyle || {}) }}
      >
        {label}
      </Badge>
    );
  };

  // Copie exacte de la fonction du header pour cohérence visuelle
  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'planificateur':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'caissier':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'chauffeur':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  useEffect(() => {
    const saveSettingsToFirestore = async () => {
      const { db } = await import('../../services/firebaseClient');
      const { doc, setDoc } = await import('firebase/firestore');
      const ref = doc(db, 'admin_settings', 'heartbeat');
      await setDoc(ref, settings, { merge: true });
    };
    saveSettingsToFirestore();
  }, [settings]);

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

  return (
    <div className={viewMode === 'mobile' ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'min-h-screen bg-background w-full overflow-x-hidden'}>
    <style>{viewMode === 'mobile' ? `
      html, body, .max-w-[430px] {
        font-size: 15px !important;
      }
      .card, .rounded-lg, .p-6, .px-6, .py-1 {
        padding: 8px !important;
      }
      .text-3xl, .text-2xl, .text-lg {
        font-size: 1.2rem !important;
      }
    ` : ''}</style>
    <Header onProfileClick={handleProfileClick} />
    {viewMode === 'mobile' && (
      <div className="flex px-2 pt-3 mb-2">
        <Badge style={{ ...badgeStyle, ...onlineBadgeInline }} className={`${badgeClass} items-center gap-2 ${onlineBadgeClass} shadow`} title={isOnline ? t('dashboard.online') : t('dashboard.offline')}>
          <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
          {isOnline ? t('dashboard.online') : t('dashboard.offline')}
        </Badge>
      </div>
    )}
    <div className={viewMode === 'mobile' ? 'flex flex-col flex-1' : 'flex min-h-[calc(100vh-4rem)] relative'}>
        <AdminSidebar activeTab={activeTab} onTabChange={setActiveTab} viewMode={viewMode === 'mobile' ? 'mobile' : 'desktop'} />
        <div className={viewMode === 'mobile' ? 'flex-1 p-2 w-full min-h-0' : 'flex-1 p-6 pt-16 overflow-auto relative min-h-0'}>
          {/* Badge En ligne desktop : dans le bloc de contenu principal, en absolute top-0 right-0, comme les autres dashboards */}
          {viewMode !== 'mobile' && (
            <div className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10`}>
              <Badge style={{ ...badgeStyle, ...onlineBadgeInline }} className={`${badgeClass} items-center gap-2 font-semibold ${onlineBadgeClass} shadow`} title={isOnline ? t('dashboard.online') : t('dashboard.offline')}>
                <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                {isOnline ? t('dashboard.online') : t('dashboard.offline')}
              </Badge>
            </div>
          )}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              <h1 className="text-2xl font-bold text-foreground mb-6">Tableau de bord - Administrateur</h1>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Utilisateurs</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{users.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Sociétés</CardTitle>
                    <Building2 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{companies.length}</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Types de Véhicules</CardTitle>
                    <Truck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{vehicleTypes.length}</div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Gestion des Utilisateurs</h2>
                <Dialog open={showCreateUser} onOpenChange={setShowCreateUser}>
                  <DialogTrigger asChild>
                    <Button className="flex items-center gap-2">
                      <Plus className="h-4 w-4" />
                      {t('buttons.add')}
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                      <DialogHeader>
                      <DialogTitle>
                        {editingUser ? (t('forms.edit') + ' ' + (t('admin.fullName') || 'utilisateur')) : (t('forms.add') + ' ' + (t('admin.fullName') || 'nouvel utilisateur'))}
                      </DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleCreateUser} className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="firstName">Prénom *</Label>
                          <Input
                            id="firstName"
                            value={newUser.firstName}
                            onChange={(e) => setNewUser({ ...newUser, firstName: e.target.value })}
                            required
                          />
                        </div>
                        <div>
                          <Label htmlFor="lastName">Nom *</Label>
                          <Input
                            id="lastName"
                            value={newUser.lastName}
                            onChange={(e) => setNewUser({ ...newUser, lastName: e.target.value })}
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <Label htmlFor="username">Nom d'utilisateur *</Label>
                        <Input
                          id="username"
                          value={newUser.username}
                          onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                          required
                        />
                      </div>
                     <div>
                       <Label htmlFor="password">Mot de passe{editingUser ? '' : ' *'}</Label>
                       <Input
                         id="password"
                         type="password"
                         value={newUser.password}
                         onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                         required={!editingUser}
                         minLength={editingUser ? 0 : 6}
                         placeholder={editingUser ? 'Laisser vide pour ne pas changer' : ''}

                       />
                     </div>
                      <div>
                        <Label htmlFor="role">Rôle</Label>
                        <Select value={newUser.role} onValueChange={(value) => setNewUser({ ...newUser, role: value as UserType['role'] })}>
                          <SelectTrigger>
                              <SelectValue placeholder={t('forms.selectPlaceholder') || 'Sélectionner un rôle'} />
                            </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="chauffeur">{t('roles.chauffeur') || 'Chauffeur'}</SelectItem>
                            <SelectItem value="planificateur">{t('roles.planificateur') || 'Planificateur'}</SelectItem>
                            <SelectItem value="caissier">{t('roles.caissier') || 'Caissier'}</SelectItem>
                            <SelectItem value="admin">{t('roles.admin') || 'Administrateur'}</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <PhoneNumbersField
                        label={t('planificateur.phoneNumbers') || 'Numéros de téléphone'}
                        addLabel={t('planificateur.add')}
                        phones={newUser.phone}
                        onChange={(phones) => setNewUser({ ...newUser, phone: phones })}
                      />
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1">
                          {editingUser ? (t('forms.edit') || 'Modifier') : (t('forms.add') || 'Créer')}
                        </Button>
                        <Button type="button" variant="outline" onClick={() => {
                          setShowCreateUser(false);
                          setEditingUser(null);
    setNewUser({
      username: '',
      role: 'chauffeur',
      firstName: '',
      lastName: '',
      phone: [],
      password: ''
    });
                        }}>
                          {t('forms.cancel') || 'Annuler'}
                        </Button>
                      </div>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>

              {/* Dialog for changing password */}
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogContent className="max-w-md">
                  <DialogHeader>
                    <DialogTitle>{t('settings.changePassword') || 'Changer le mot de passe'}</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleChangePassword} className="space-y-4">
                    <div>
                      <Label htmlFor="newPassword">Nouveau mot de passe *</Label>
                      <Input
                        id="newPassword"
                        type="password"
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div>
                      <Label htmlFor="confirmPassword">Confirmer le mot de passe *</Label>
                      <Input
                        id="confirmPassword"
                        type="password"
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                        minLength={6}
                      />
                    </div>
                    <div className="flex gap-2 pt-4">
                      <Button type="submit" className="flex-1">
                        Changer le mot de passe
                      </Button>
                      <Button type="button" variant="outline" onClick={() => {
                        setShowChangePassword(false);
                        setSelectedUserForPassword(null);
                        setPasswordData({ newPassword: '', confirmPassword: '' });
                      }}>
                        Annuler
                      </Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              <Card>
                <CardContent className="p-0">
                  {/* Sélecteur de zoom pour utilisateurs */}
                  <div className="flex items-center justify-end mb-2">
                    <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
                    <select
                      value={userTableFontSize}
                      onChange={e => handleUserTableZoom(e.target.value)}
                      className="border rounded px-2 py-1 text-xs bg-background"
                      title="Zoom sur la taille d'écriture du tableau"
                    >
                      <option value="100">100%</option>
                      <option value="90">90%</option>
                      <option value="80">80%</option>
                      <option value="70">70%</option>
                      <option value="60">60%</option>
                    </select>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                          <TableRow className={userRowHeight}>
                            <TableHead style={userFontSizeStyle}>{t('admin.fullName') || 'Nom complet'}</TableHead>
                            <TableHead style={userFontSizeStyle}>{t('admin.username') || "Nom d'utilisateur"}</TableHead>
                            <TableHead style={userFontSizeStyle}>{t('admin.role') || 'Rôle'}</TableHead>
                            <TableHead style={{...userFontSizeStyle, textAlign: 'center', paddingLeft: 0, paddingRight: 0}}>{t('admin.lastLogin') || 'Connexion'}</TableHead>
                            <TableHead style={userFontSizeStyle}>{t('admin.phone') || 'Téléphone'}</TableHead>
                            <TableHead style={userFontSizeStyle}>{t('admin.password') || 'Mot de passe'}</TableHead>
                            <TableHead style={userFontSizeStyle}>{t('admin.actions') || 'Actions'}</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {users.map((user) => (
                            <TableRow key={user.id} className={userRowHeight}>
                              <TableCell className="font-medium" style={userFontSizeStyle}>{user.fullName}</TableCell>
                              <TableCell style={userFontSizeStyle}>{user.username}</TableCell>
                              <TableCell style={userFontSizeStyle}>
                                {/* Badge rôle harmonisé (identique header) - use getRoleBadge for translation & consistent style */}
                                {getRoleBadge(user.role)}
                              </TableCell>
                              {/* Connexion column */}
                              <TableCell style={{textAlign: 'center', paddingLeft: 0, paddingRight: 0}}>
    {/* Statut connexion : point vert (en ligne) ou rouge (hors ligne) avec glow/ombre */}
    <span
      title={user.isOnline ? 'En ligne' : 'Hors ligne'}
      style={{
        display: 'inline-block',
        width: 14,
        height: 14,
        borderRadius: '50%',
        background: user.isOnline ? '#22c55e' : '#ef4444',
        boxShadow: user.isOnline
          ? '0 0 8px 2px #22c55e, 0 2px 6px rgba(34,197,94,0.3)'
          : '0 0 6px 1px #ef4444, 0 2px 6px rgba(239,68,68,0.3)',
        margin: '0 auto',
      }}
    />
  </TableCell>
                              <TableCell style={userFontSizeStyle}>
                                {user.phone && user.phone.length > 0 ? (
                                  <div className="space-y-1">
                                    {user.phone.map((phone, index) => (
                                      <div key={index} className="text-sm" style={userFontSizeStyle}>{phone}</div>
                                    ))}
                                  </div>
                                ) : '-'}
                              </TableCell>
                              <TableCell style={userFontSizeStyle}>
                                {/* Affiche toujours 8 points pour le mot de passe */}
                                <span style={{ letterSpacing: 2 }}>{'•'.repeat(8)}</span>
                              </TableCell>
                              <TableCell style={userFontSizeStyle}>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={{ fontSize: `${Math.round(14 * (zoomLevels[userTableFontSize] || 1))}px` }}
                                  onClick={() => handleEditUser(user)}
                                >
                                  <Edit className="h-4 w-4" style={{ width: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px`, height: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px` }} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={{ fontSize: `${Math.round(14 * (zoomLevels[userTableFontSize] || 1))}px` }}
                                  onClick={() => openChangePasswordDialog(user.id)}
                                >
                                  <Key className="h-4 w-4" style={{ width: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px`, height: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px` }} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={{ fontSize: `${Math.round(14 * (zoomLevels[userTableFontSize] || 1))}px` }}
                                  onClick={() => handleDeleteUser(user.id)}
                                >
                                  <Trash2 className="h-4 w-4" style={{ width: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px`, height: `${Math.round(16 * (zoomLevels[userTableFontSize] || 1))}px` }} />
                                </Button>
                                {/* Confirmation dialog for user deletion */}
      <AlertDialog open={!!userToDelete} onOpenChange={open => { if (!open) setUserToDelete(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
          </AlertDialogHeader>
          <div>Êtes-vous sûr de vouloir supprimer cet utilisateur ? Cette action est irréversible.</div>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeleteUser}>Supprimer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'configuration' && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold">Configuration</h2>

              {/* Paramètres heartbeat organisés */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg font-bold">Paramètres d'actualisation automatique</CardTitle>
                  <CardDescription>
                    <span className="block text-sm text-muted-foreground">Par défaut, toutes les actualisations sont activées.<br/>Online toutes les 60s, GPS et Position toutes les 120s.</span>
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4 p-4 rounded-lg border bg-background">
                      <Label className="font-bold text-blue-700">Statut Online</Label>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatOnlineEnabled} onChange={e => setHeartbeatOnlineEnabled?.(e.target.checked)} /> Activer actualisation automatique
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatOnlineImmediate} onChange={e => setHeartbeatOnlineImmediate?.(e.target.checked)} /> Actualisation immédiate au démarrage
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Intervalle :</span>
                          <Input
                            id="heartbeatOnlineInterval"
                            type="number"
                            min={5}
                            value={settings.heartbeatOnlineInterval ?? 60}
                            onChange={e => setHeartbeatOnlineInterval?.(parseInt(e.target.value) || 60)}
                            style={{ width: 80 }}
                            placeholder="60"
                          />
                          <span className="text-xs">secondes</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 rounded-lg border bg-background">
                      <Label className="font-bold text-green-700">Statut GPS</Label>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatGpsEnabled} onChange={e => setHeartbeatGpsEnabled?.(e.target.checked)} /> Activer actualisation automatique
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatGpsImmediate} onChange={e => setHeartbeatGpsImmediate?.(e.target.checked)} /> Actualisation immédiate à l'activation GPS
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Intervalle :</span>
                          <Input
                            id="heartbeatGpsInterval"
                            type="number"
                            min={5}
                            value={settings.heartbeatGpsInterval ?? 120}
                            onChange={e => setHeartbeatGpsInterval?.(parseInt(e.target.value) || 120)}
                            style={{ width: 80 }}
                            placeholder="120"
                          />
                          <span className="text-xs">secondes</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 rounded-lg border bg-background">
                      <Label className="font-bold text-purple-700">Position GPS</Label>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatPositionEnabled} onChange={e => setHeartbeatPositionEnabled?.(e.target.checked)} /> Activer actualisation automatique
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.heartbeatPositionImmediate} onChange={e => setHeartbeatPositionImmediate?.(e.target.checked)} /> Actualisation immédiate à l'activation GPS
                        </label>
                        <div className="flex items-center gap-2">
                          <span className="text-xs">Intervalle :</span>
                          <Input
                            id="heartbeatPositionInterval"
                            type="number"
                            min={5}
                            value={settings.heartbeatPositionInterval ?? 120}
                            onChange={e => setHeartbeatPositionInterval?.(parseInt(e.target.value) || 120)}
                            style={{ width: 80 }}
                            placeholder="120"
                          />
                          <span className="text-xs">secondes</span>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4 p-4 rounded-lg border bg-background">
                      <Label className="font-bold text-orange-700">Demande d'activation GPS</Label>
                      <div className="flex flex-col gap-2 mt-2">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={!!settings.gpsActivationRequestEnabled} onChange={e => setGpsActivationRequestEnabled?.(e.target.checked)} /> Activer la demande d'activation GPS au démarrage
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Sociétés */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Sociétés</CardTitle>
                      <CardDescription>Gestion des sociétés partenaires</CardDescription>
                    </div>
                    <Dialog open={showCreateCompany} onOpenChange={setShowCreateCompany}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('buttons.add')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingCompany ? (t('forms.edit') + ' ' + (t('companies.name') || 'société')) : (t('forms.add') + ' ' + (t('companies.name') || 'nouvelle société'))}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateCompany} className="space-y-4">
                          <div>
                            <Label htmlFor="companyName">Nom de la société *</Label>
                            <Input
                              id="companyName"
                              value={newCompany.name}
                              onChange={(e) => setNewCompany({ ...newCompany, name: e.target.value })}
                              required
                            />
                          </div>
                          <div>
                            <Label htmlFor="companyAddress">Adresse</Label>
                            <Input
                              id="companyAddress"
                              value={newCompany.address}
                              onChange={(e) => setNewCompany({ ...newCompany, address: e.target.value })}
                            />
                          </div>
                          <PhoneNumbersField
                            label={t('planificateur.phoneNumbers') || 'Numéros de téléphone'}
                            phones={newCompany.phone}
                            onChange={(phones) => setNewCompany({ ...newCompany, phone: phones })}
                          />
                          <div>
                            <Label htmlFor="companyEmail">Email</Label>
                            <Input
                              id="companyEmail"
                              type="email"
                              value={newCompany.email}
                              onChange={(e) => setNewCompany({ ...newCompany, email: e.target.value })}
                            />
                          </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingCompany ? (t('forms.edit') || 'Modifier') : (t('forms.add') || 'Créer')}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowCreateCompany(false);
                              setEditingCompany(null);
                              setNewCompany({ name: '', address: '', phone: [], email: '' });
                            }}>
                              {t('forms.cancel') || 'Annuler'}
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Sélecteur de zoom pour sociétés */}
                  <div className="flex items-center justify-end mb-2">
                    <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
                    <select
                      value={companyTableFontSize}
                      onChange={e => handleCompanyTableZoom(e.target.value)}
                      className="border rounded px-2 py-1 text-xs bg-background"
                      title="Zoom sur la taille d'écriture du tableau"
                    >
                      <option value="100">100%</option>
                      <option value="90">90%</option>
                      <option value="80">80%</option>
                      <option value="70">70%</option>
                      <option value="60">60%</option>
                    </select>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className={userRowHeight}>
                          <TableHead style={userFontSizeStyle}>{t('companies.name')}</TableHead>
                          <TableHead style={userFontSizeStyle}>{t('companies.address')}</TableHead>
                          <TableHead style={userFontSizeStyle}>{t('companies.phone')}</TableHead>
                          <TableHead style={userFontSizeStyle}>{t('companies.email')}</TableHead>
                          <TableHead style={userFontSizeStyle}>{t('companies.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {companies.map((company) => (
                          <TableRow key={company.id} className={userRowHeight}>
                            <TableCell className="font-medium" style={userFontSizeStyle}>{company.name}</TableCell>
                            <TableCell style={userFontSizeStyle}>{company.address || '-'}</TableCell>
                            <TableCell style={userFontSizeStyle}>
                              {company.phone && company.phone.length > 0 ? (
                                <div className="space-y-1">
                                  {company.phone.map((phone, index) => (
                                    <div key={index} className="text-sm" style={userFontSizeStyle}>{phone}</div>
                                  ))}
                                </div>
                              ) : '-'}
                            </TableCell>
                            <TableCell style={userFontSizeStyle}>{company.email || '-'}</TableCell>
                            <TableCell style={userFontSizeStyle}>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={userFontSizeStyle}
                                  onClick={() => handleEditCompany(company)}
                                >
                                  <Edit className="h-4 w-4" style={{ width: `16px`, height: `16px` }} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={userFontSizeStyle}
                                  onClick={() => handleDeleteCompany(company.id)}
                                >
                                  <Trash2 className="h-4 w-4" style={{ width: `16px`, height: `16px` }} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Types de véhicules */}
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>Types de Véhicules</CardTitle>
                      <CardDescription>Gestion des types de véhicules disponibles</CardDescription>
                    </div>
                    <Dialog open={showCreateVehicleType} onOpenChange={setShowCreateVehicleType}>
                      <DialogTrigger asChild>
                        <Button size="sm">
                          <Plus className="h-4 w-4 mr-2" />
                          {t('buttons.add')}
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>
                            {editingVehicleType ? (t('forms.edit') + ' ' + (t('vehicleTypes.name') || 'le type de véhicule')) : (t('forms.add') + ' ' + (t('vehicleTypes.name') || 'nouveau type de véhicule'))}
                          </DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleCreateVehicleType} className="space-y-4">
                          <div>
    <Label htmlFor="vehicleTypeName">Nom du type *</Label>
    <Input
      id="vehicleTypeName"
      value={newVehicleType.name}
      onChange={(e) => setNewVehicleType({ ...newVehicleType, name: e.target.value })}
      required
    />
  </div>
  <div>
    <Label htmlFor="vehicleTypePrimeKm">Prime kilométrique *</Label>
    <Input
      id="vehicleTypePrimeKm"
      type="number"
      step="0.01"
      min="0"
      value={newVehicleType.primeKilometrique}
      onChange={(e) => setNewVehicleType({ ...newVehicleType, primeKilometrique: e.target.value })}
      required
      placeholder="Ex: 150.00"
    />
  </div>
                          <div className="flex gap-2 pt-4">
                            <Button type="submit" className="flex-1">
                              {editingVehicleType ? 'Modifier' : 'Créer'}
                            </Button>
                            <Button type="button" variant="outline" onClick={() => {
                              setShowCreateVehicleType(false);
                              setEditingVehicleType(null);
                              setNewVehicleType({ name: '', primeKilometrique: '' });
                            }}>
                              Annuler
                            </Button>
                          </div>
                        </form>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  {/* Sélecteur de zoom pour types de véhicules */}
                  <div className="flex items-center justify-end mb-2">
                    <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
                    <select
                      value={vehicleTypeTableFontSize}
                      onChange={e => handleVehicleTypeTableZoom(e.target.value)}
                      className="border rounded px-2 py-1 text-xs bg-background"
                      title="Zoom sur la taille d'écriture du tableau"
                    >
                      <option value="100">100%</option>
                      <option value="90">90%</option>
                      <option value="80">80%</option>
                      <option value="70">70%</option>
                      <option value="60">60%</option>
                    </select>
                  </div>
                  <div className="w-full overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className={vehicleTypeRowHeight} style={vehicleTypeFontSizeStyle}>
                          <TableHead>{t('vehicleTypes.name')}</TableHead>
                          <TableHead>{t('vehicleTypes.primeKilometrique')}</TableHead>
                          <TableHead>{t('vehicleTypes.actions')}</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {vehicleTypes.map((vehicleType) => (
                          <TableRow key={vehicleType.id} className={vehicleTypeRowHeight} style={vehicleTypeFontSizeStyle}>
                            <TableCell className="font-medium">{vehicleType.name}</TableCell>
                            <TableCell>{vehicleType.primeKilometrique != null ? vehicleType.primeKilometrique.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : '-'}</TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={vehicleTypeFontSizeStyle}
                                  onClick={() => handleEditVehicleType(vehicleType)}
                                  className="p-0"
                                >
                                  <Edit className={`${vehicleTypeIconSize} min-w-0`} />
                                </Button>
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  style={vehicleTypeFontSizeStyle}
                                  onClick={() => handleDeleteVehicleType(vehicleType.id)}
                                  className="p-0"
                                >
                                  <Trash2 className={`${vehicleTypeIconSize} min-w-0`} />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>

              {/* Motifs de refus (nouvelle section) */}
              <Card>
                <CardHeader>
                  <div className="flex flex-row-reverse items-center justify-between">
                    <RefusalReasonsConfig showAddButton onlyButton />
                    <div className="flex-1">
                      <CardTitle>Motifs de Refus</CardTitle>
                      <CardDescription>Gestion des motifs de refus multilingues</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <RefusalReasonsConfig hideHeader />
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
