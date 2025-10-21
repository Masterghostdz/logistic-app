import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSharedData } from '../contexts/SharedDataContext';
import { Declaration } from '../types';
import EditDeclarationDialog from './EditDeclarationDialog';
import { useSettings } from '../contexts/SettingsContext';
import { Button } from './ui/button';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import TextWithProgramRef from './TextWithProgramRef';
import useTableZoom from '../hooks/useTableZoom';
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
    // Real-time listener for notifications. For planificateur we listen to recipientRole==planificateur,
    // for chauffeur we listen to chauffeurId==currentUserId. We order by createdAt desc when available.
    if (!user?.id) return;
    let unsubscribe: (() => void) | undefined;

    (async () => {
      try {
        const { db } = await import('../services/firebaseClient');
        const { collection, query, where, onSnapshot, orderBy } = await import('firebase/firestore');
        const coll = collection(db, 'notifications');
        let q;
        if (user.role === 'planificateur') {
          try { q = query(coll, where('recipientRole', '==', 'planificateur'), orderBy('createdAt', 'desc')); } catch (e) { q = query(coll, where('recipientRole', '==', 'planificateur')); }
        } else if (user.role === 'chauffeur') {
          try { q = query(coll, where('chauffeurId', '==', user.id), orderBy('createdAt', 'desc')); } catch (e) { q = query(coll, where('chauffeurId', '==', user.id)); }
        } else {
          // other roles do not have notifications dropdown
          return;
        }

        unsubscribe = onSnapshot(q, (snap) => {
          const notifs = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
          setNotifState(notifs);
        }, (err) => {
          console.warn('Notifications realtime listener error', err);
          // fallback to one-shot fetch if snapshot fails
          (async () => {
            try {
              if (user.role === 'planificateur') {
                const { getNotificationsForPlanificateur } = await import('../services/notificationService');
                const notifs = await getNotificationsForPlanificateur(user.id);
                setNotifState(notifs);
              } else if (user.role === 'chauffeur') {
                const { getNotificationsForChauffeur } = await import('../services/notificationService');
                const notifs = await getNotificationsForChauffeur(user.id);
                setNotifState(notifs);
              }
            } catch (e) {
              console.warn('Fallback one-shot notifications fetch failed', e);
            }
          })();
        });
      } catch (e) {
        console.warn('Failed to initialize notifications listener', e);
        // fallback one-shot fetch
        try {
          if (user.role === 'planificateur') {
            const { getNotificationsForPlanificateur } = await import('../services/notificationService');
            const notifs = await getNotificationsForPlanificateur(user.id);
            setNotifState(notifs);
          } else if (user.role === 'chauffeur') {
            const { getNotificationsForChauffeur } = await import('../services/notificationService');
            const notifs = await getNotificationsForChauffeur(user.id);
            setNotifState(notifs);
          }
        } catch (err) {
          console.warn('Fallback one-shot notifications fetch failed', err);
        }
      }
    })();

    return () => { if (unsubscribe) unsubscribe(); };
  }, [user?.id, user?.role]);

  const handleNotifClick = async (id: string) => {
    if (user?.role === 'planificateur') {
      const { markNotificationAsRead, getNotificationsForPlanificateur } = await import('../services/notificationService');
      await markNotificationAsRead(id);
      if (user?.id) {
        const notifs = await getNotificationsForPlanificateur(user.id);
        setNotifState(notifs);
      }
    } else if (user?.role === 'chauffeur') {
      const { markNotificationAsRead, getNotificationsForChauffeur } = await import('../services/notificationService');
      await markNotificationAsRead(id);
      if (user?.id) {
        const notifs = await getNotificationsForChauffeur(user.id);
        setNotifState(notifs);
      }
    }
  };
  // Un seul état pour gérer l'ouverture des deux menus glissants
  // 'none' | 'notifications' | 'avatar'
  const [openMenu, setOpenMenu] = useState<'none' | 'notifications' | 'avatar'>('none');
  // When user opens the notifications menu we hide the small bell indicator
  // immediately (so the bell no longer shows the unread count). The
  // per-item unread markers inside the dropdown remain unchanged.
  const [hideBellIndicator, setHideBellIndicator] = useState(false);
  const prevUnreadRef = useRef<number>(0);
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  // Precompute rendered notifications to avoid showing an empty dropdown
  // when `notifState` contains items that are filtered-out for the current role
  const renderedNotifications = useMemo(() => {
    if (!Array.isArray(notifState) || notifState.length === 0) return [];
    return notifState.map((notif) => {
      let declaration: any = null;
      let message: any = notif.message;

      if (notif.declarationId) {
        declaration = declarations.find((d: any) => d.id === notif.declarationId) || null;
      }

      if (!declaration && notif.programParts) {
        const pp = notif.programParts as any;
        declaration = declarations.find((d: any) => {
          const yearMatch = String(d.year).endsWith(String(pp.year)) || String(d.year) === String(pp.year);
          const monthMatch = String(d.month) === String(pp.month);
          const numMatch = String(d.programNumber) === String(pp.number) || String(d.number) === String(pp.number);
          return yearMatch && monthMatch && numMatch;
        }) || null;
      }

      if (!declaration && typeof notif.message === 'string') {
        const refMatch = notif.message.match(/DCP\/(\d{2,4})\/(\d{1,2})\/(\d+)/);
        if (refMatch) {
          const [, y, m, n] = refMatch;
          declaration = declarations.find((d: any) => {
            const yearMatch = String(d.year).endsWith(String(y)) || String(d.year) === String(y);
            const monthMatch = String(d.month) === String(m);
            const numMatch = String(d.programNumber) === String(n) || String(d.number) === String(n);
            return yearMatch && monthMatch && numMatch;
          }) || null;
        }
      }

      if (user?.role === 'planificateur') {
        // For planificateur we want to show the same notification history as chauffeurs.
        // Do not filter-out items that cannot be resolved to an 'en_panne' declaration.
        // Preserve the original `notif.message` when present; if message is missing
        // but we resolved a declaration, construct a friendly fallback message.
        if ((!message || String(message).trim() === '') && declaration) {
          const chauffeurName = declaration.chauffeurName || 'Inconnu';
          const refProgramme = declaration.programNumber && declaration.year && declaration.month
            ? `DCP/${declaration.year}/${declaration.month}/${declaration.programNumber}`
            : '';
          message = `Chauffeur "${chauffeurName}" a tombé en panne${refProgramme ? ` dans le programme "${refProgramme}"` : ''}`;
        }
      }

      return { notif, declaration, message } as any;
    }).filter(x => x !== null);
  }, [notifState, declarations, user?.role]);



  // Détection du mode mobile via hook partagé
  const { settings } = useSettings();

  // Header mobile natif pour le profil
  if (variant === 'profile' && settings.viewMode === 'mobile') {
    return (
      <header dir="ltr" className="border-b border-border bg-card shadow-sm">
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
      case 'caissier':
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

  const { badgeClass, badgeStyle } = useTableZoom();
  // Compute avatar size (px) to keep glow and avatar consistent between mobile/desktop
  const avatarPx = settings.viewMode === 'mobile' ? 28 : 32;
  // Role badge needs a compact override because badgeStyle contains dynamic inline
  // values (fontSize, padding, minWidth) used across the app. We deliberately
  // override those here so the role badge appears visually smaller.
  const roleBadgeStyle: React.CSSProperties = {
    ...(badgeStyle || {}),
    fontSize: '11.5px',
    padding: '3px 8px',
    minWidth: '0',
    lineHeight: '14px',
    // Use a very large radius to preserve the original pill shape
    borderRadius: '9999px',
  };
  // Compute a safe, translated role label to avoid rendering 'undefined'
  const roleKey = user?.role || '';
  const roleLabel = roleKey ? (t(`roles.${roleKey}`) || roleKey) : '';

  return (
    <>
  <header dir="ltr" className="border-b border-gray-300 dark:border-border bg-gray-100 dark:bg-card shadow-sm">
  <div className={`flex ${settings.viewMode === 'mobile' ? 'h-12' : 'h-16'} items-center justify-between pl-1 pr-4 lg:pl-3 lg:pr-6`}>
          {/* Logo à gauche */}
          <div className={`flex items-center gap-2 flex-1 ${settings.viewMode === 'mobile' ? 'pr-12' : 'pr-6 lg:pr-10'} min-w-0`}>
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
          <div className={`flex items-center ml-auto ${settings.viewMode === 'mobile' ? 'gap-2' : 'gap-4'}`}>
              <Badge size="sm" className={`${badgeClass} border ${getRoleBadgeColor(roleKey)} leading-none`} style={roleBadgeStyle}>
                    {roleLabel}
                  </Badge>
            {/* Notification Circle Button & Dropdown for Chauffeur & Planificateur */}
            {(user?.role === 'chauffeur' || user?.role === 'planificateur') && (
              <DropdownMenu
                open={openMenu === 'notifications'}
                onOpenChange={open => {
                  setOpenMenu(open ? 'notifications' : 'none');
                  if (open) {
                    // hide the small indicator on the bell immediately when opening
                    setHideBellIndicator(true);
                  }
                }}
              >
                <DropdownMenuTrigger asChild>
                  <button
                    className={`relative ${settings.viewMode === 'mobile' ? 'h-7 w-7' : 'h-8 w-8'} rounded-full flex items-center justify-center border border-white-600 hover:bg-white-50 transition`}
                    title="Notifications"
                    style={{ marginRight: 0 }}
                  >
                    <span className="material-icons text-white-600 text-lg">notifications</span>
                    {(() => {
                      const unreadCount = Array.isArray(notifState) ? notifState.filter(n => !n.read).length : 0;
                      // Show the bell indicator only when there are unread items and
                      // the indicator hasn't been hidden by opening the menu.
                      return (unreadCount > 0 && !hideBellIndicator) ? (
                        <span className="absolute -top-1 -right-1 bg-orange-500 animate-pulse text-white text-xs rounded-full px-1.5 py-0.5 font-bold">
                          {unreadCount}
                        </span>
                      ) : null;
                    })()}
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-popover border-border" align="end" forceMount>
                  <div className="max-h-80 overflow-y-auto">
                    {renderedNotifications.length > 0 ? renderedNotifications.map((item: any) => {
                      const { notif, declaration, message } = item;
                      return (
                        <div
                          key={notif.id}
                          className="relative flex flex-col px-4 py-2 border-b last:border-b-0 gap-1 border-border dark:border-border cursor-pointer"
                          onClick={() => {
                            handleNotifClick(notif.id);
                            if (declaration) setConsultDeclaration(declaration);
                          }}
                        >
                          {typeof message === 'string' ? (
                            <span className={notif.read ? 'text-xs text-muted-foreground' : 'text-xs font-semibold text-popover-foreground'}>
                              <TextWithProgramRef text={message} />
                            </span>
                          ) : (
                            <span className={notif.read ? 'text-xs text-muted-foreground' : 'text-xs font-semibold text-popover-foreground'}>{message}</span>
                          )}
                          {!notif.read && (
                            <span className="absolute top-1 right-2 h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                          )}
                        </div>
                      );
                    }) : (
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
                    size="icon"
                    className={`relative p-0 overflow-visible ${settings.viewMode === 'mobile' ? 'h-7 w-7' : 'h-8 w-8'} rounded-full hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring shadow-[0_0_0_1px_hsl(var(--input))] hover:shadow-[0_0_0_2px_hsl(var(--input))] active:shadow-[0_0_0_2px_hsl(var(--input))] focus-visible:shadow-[0_0_0_2px_hsl(var(--input))] transition-shadow duration-150`}
                    onClick={() => {
                      if (openMenu === 'notifications') setOpenMenu('avatar');
                      else setOpenMenu(openMenu === 'avatar' ? 'none' : 'avatar');
                    }}
                  >
                  {(user?.role === 'chauffeur' || user?.role === 'caissier') && user?.employeeType === 'interne' && (
                    // Centered circular glow sized to the avatar to match shape on mobile
                    <span
                      className="absolute pointer-events-none"
                      style={{
                        width: `${avatarPx}px`,
                        height: `${avatarPx}px`,
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        borderRadius: '9999px',
                        boxShadow: '0 0 0 2px rgba(255,215,0,0.95), 0 0 10px 6px rgba(255,215,0,0.35)',
                        zIndex: 20,
                        transition: 'box-shadow 0.3s, transform 0.15s',
                        display: 'block'
                      }}
                    />
                  )}
                  <Avatar className={`${settings.viewMode === 'mobile' ? 'h-7 w-7' : 'h-8 w-8'} relative z-30`}>
                    <AvatarImage src={user?.avatar} alt={user?.firstName} />
                    <AvatarFallback className={`bg-muted text-muted-foreground ${settings.viewMode === 'mobile' ? 'text-sm' : 'text-base'} font-medium`}> 
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
