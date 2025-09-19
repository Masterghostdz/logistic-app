

import React, { useState, useEffect } from 'react';
import { useSharedData } from '../contexts/SharedDataContext';
import { Declaration } from '../types';
import EditDeclarationDialog from './EditDeclarationDialog';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { User, Settings, LogOut, Menu } from 'lucide-react';
import SettingsDialog from './SettingsDialog';
import ProfilePage from './ProfilePage';

import { ArrowLeft } from 'lucide-react';

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  onProfileClick?: () => void;
  variant?: 'default' | 'profile';
  onBack?: () => void;
  notificationCount?: number;
  onNotificationClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false, onProfileClick, variant = 'default', onBack, notificationCount = 0, onNotificationClick }) => {
  const { declarations } = useSharedData();
  // Ajout pour consultation déclaration
  const [consultDeclaration, setConsultDeclaration] = useState<Declaration | null>(null);
  // Notifications Firestore
  const [notifState, setNotifState] = useState<any[]>([]);
  const { user, logout } = useAuth();
  useEffect(() => {
    async function fetchNotifications() {
      const { getNotificationsForChauffeur } = await import('../services/notificationService');
      if (user?.id) {
        const notifs = await getNotificationsForChauffeur(user.id);
        setNotifState(notifs);
      }
    }
    fetchNotifications();
  }, [user?.id]);

  const handleNotifClick = async (id: string) => {
    const { markNotificationAsRead, getNotificationsForChauffeur } = await import('../services/notificationService');
    await markNotificationAsRead(id);
    // Recharger les notifications pour mettre à jour l'état lu
    if (user?.id) {
      const notifs = await getNotificationsForChauffeur(user.id);
      setNotifState(notifs);
    }
  };
  // Un seul état pour gérer l'ouverture des deux menus glissants
  // 'none' | 'notifications' | 'avatar'
  const [openMenu, setOpenMenu] = useState<'none' | 'notifications' | 'avatar'>('none');
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);



  // Détection du mode mobile via hook partagé
  const { settings } = useSettings();

  // Header mobile natif pour le profil
  if (variant === 'profile' && settings.viewMode === 'mobile') {
    return (
      <header className="border-b border-border bg-card shadow-sm">
        <div className="flex items-center h-12 px-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onBack}>
            <ArrowLeft className="h-6 w-6" />
          </Button>
          <h1 className="text-xl font-bold flex-1 text-center">Mon Profil</h1>
        </div>
      </header>
    );
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300 border-red-200 dark:border-red-800';
      case 'planificateur':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'financier':
        return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300 border-green-200 dark:border-green-800';
      case 'chauffeur':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const handleProfileClick = () => {
    if (onProfileClick) {
      onProfileClick();
    } else {
      setShowProfile(true);
    }
  };

  // Si on affiche le profil, on rend ProfilePage
  if (showProfile) {
    return <ProfilePage onBack={() => setShowProfile(false)} />;
  }

  return (
    <>
      <header className="border-b border-border bg-card shadow-sm">
  <div className="flex h-16 items-center justify-between pl-1 pr-4 lg:pl-3 lg:pr-6">
          {/* Logo à gauche */}
          <div className="flex items-center gap-2">
            {showMenuButton && (
              <Button
                variant="ghost"
                size="icon"
                onClick={onMenuToggle}
                className="lg:hidden text-foreground hover:bg-accent"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}
            <img 
              src="/lovable-uploads/691c7b4f-298c-4d87-a195-fb432aab8f82.png" 
              alt="Logigrine Logo" 
              className={settings.viewMode === 'mobile' ? 'h-8 -ml-0' : 'h-10 -ml-1'}
              style={settings.viewMode === 'mobile' ? { width: 'auto', maxHeight: '32px' } : { width: 'auto', maxHeight: '40px' }}
            />
          </div>

          {/* Rôle et photo de profil à droite */}
          <div className="flex items-center gap-4">
            <Badge className={`border ${getRoleBadgeColor(user?.role || '')}`}>
              {user?.role}
            </Badge>
            {/* Notification Circle Button & Dropdown for Chauffeur */}
            {user?.role === 'chauffeur' && (
              <DropdownMenu open={openMenu === 'notifications'} onOpenChange={open => setOpenMenu(open ? 'notifications' : 'none')}>
                <DropdownMenuTrigger asChild>
                  <button
                    className="relative h-8 w-8 rounded-full flex items-center justify-center border border-white-600 hover:bg-white-50 transition"
                    title="Notifications"
                    style={{ marginRight: 0 }}
                  >
                    <span className="material-icons text-white-600 text-lg">notifications</span>
                    {notifState.filter(n => !n.read && n.message.toLowerCase().includes('déclaration')).length > 0 && (
                      <span className="absolute -top-1 -right-1 bg-orange-500 animate-pulse text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                        {notifState.filter(n => !n.read && n.message.toLowerCase().includes('déclaration')).length}
                      </span>
                    )}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                  <div className="max-h-80 overflow-y-auto">
                    {notifState
                      .filter(n => n.message.toLowerCase().includes('déclaration'))
                      .map((notif) => {
                        // Extraire la référence programme si présente
                        const refMatch = notif.message.match(/DCP\/(\d{2})\/(\d{2})\/(\d+)/);
                        let refProgramme = '';
                        let customMessage = notif.message;
                        let declaration;
                        if (refMatch) {
                          refProgramme = `DCP/${refMatch[1]}/${refMatch[2]}/${refMatch[3]}`;
                          declaration = declarations.find((d: any) => d.year === refMatch[1] && d.month === refMatch[2] && d.programNumber === refMatch[3]);
                        }
                        // Si pas de refMatch, essayer de matcher par type de notification
                        if (!refProgramme && notif.message.toLowerCase().includes('déclaration')) {
                          // Chercher une déclaration récente
                          declaration = declarations[0];
                          if (declaration) {
                            refProgramme = `DCP/${declaration.year}/${declaration.month}/${declaration.programNumber}`;
                          }
                        }
                        let refColor = 'text-orange-600 font-bold';
                        let statusColor = '';
                        let statusText = '';
                        if (refProgramme) {
                          if (notif.message.toLowerCase().includes('validée')) {
                            statusColor = 'text-green-600 font-bold';
                            statusText = t('dashboard.validated');
                            customMessage = `${t('notification.default', { ref: `<span class='${refColor}'>${refProgramme}</span>` })} <span class='mx-1'>est</span> <span class='${statusColor}'>${statusText}</span>`;
                          } else if (notif.message.toLowerCase().includes('refusée')) {
                            statusColor = 'text-red-600 font-bold';
                            statusText = t('dashboard.refused');
                            customMessage = `${t('notification.default', { ref: `<span class='${refColor}'>${refProgramme}</span>` })} <span class='mx-1'>est</span> <span class='${statusColor}'>${statusText}</span>`;
                          } else {
                            customMessage = t('notification.default', { ref: `<span class='${refColor}'>${refProgramme}</span>` });
                          }
                        }
                        return (
                          <div
                            key={notif.id}
                            className="relative flex flex-col px-4 py-2 border-b last:border-b-0 gap-1 border-border dark:border-border cursor-pointer"
                            onClick={() => {
                              handleNotifClick(notif.id);
                              if (declaration) setConsultDeclaration(declaration);
                            }}
                          >
                            <span className={notif.read ? 'text-xs text-muted-foreground' : 'text-xs font-semibold text-popover-foreground'} dangerouslySetInnerHTML={{ __html: customMessage }} />
                            {!notif.read && (
                              <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                            )}
                          </div>
                        );
                      })
                    }
                    {notifState.filter(n => n.message.toLowerCase().includes('déclaration')).length === 0 && (
                      <div className="px-4 py-2 text-muted-foreground">Aucune notification</div>
                    )}
                  </div>
                </DropdownMenuContent>
              {/* Affiche le formulaire de consultation déclaration si demandé */}
              {consultDeclaration && (
                <EditDeclarationDialog
                  declaration={consultDeclaration}
                  isOpen={!!consultDeclaration}
                  onClose={() => setConsultDeclaration(null)}
                  readOnly={true}
                />
              )}
            </DropdownMenu>
          )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full hover:bg-accent"
                  onClick={() => {
                    if (openMenu === 'notifications') setOpenMenu('avatar');
                    else setOpenMenu(openMenu === 'avatar' ? 'none' : 'avatar');
                  }}
                >
                  {user?.role === 'chauffeur' && user?.employeeType === 'interne' && (
                    <span
                      className="absolute inset-0 rounded-full pointer-events-none animate-glow-flicker"
                      style={{
                        boxShadow: '0 0 0 2px #FFD700, 0 0 12px 6px #FFD700cc',
                        zIndex: 20,
                        transition: 'box-shadow 0.3s',
                      }}
                    />
                  )}
                  <Avatar className="h-8 w-8 relative z-30">
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className="bg-muted text-muted-foreground">
                      {getInitials(user?.firstName || '', user?.lastName || '')}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="text-sm font-medium text-popover-foreground">{user?.firstName} {user?.lastName}</p>
                    <p className="text-xs text-muted-foreground">{user?.phone}</p>
                  </div>
                </div>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={handleProfileClick} className="text-popover-foreground hover:bg-accent">
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('header.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setShowSettings(true)} className="text-popover-foreground hover:bg-accent">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('header.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-border" />
                <DropdownMenuItem onClick={logout} className="text-popover-foreground hover:bg-accent">
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('header.logout')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      <SettingsDialog 
        open={showSettings} 
        onOpenChange={setShowSettings} 
      />
      {/* Affiche le formulaire de consultation déclaration si demandé */}
      {consultDeclaration && (
        <EditDeclarationDialog
          declaration={consultDeclaration}
          isOpen={!!consultDeclaration}
          onClose={() => setConsultDeclaration(null)}
          readOnly={true}
        />
      )}
    </>
  );
};

export default Header;
