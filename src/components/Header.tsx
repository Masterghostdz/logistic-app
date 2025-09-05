

import React, { useState } from 'react';
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

interface HeaderProps {
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
  onProfileClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuToggle, showMenuButton = false, onProfileClick }) => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const [showSettings, setShowSettings] = useState(false);
  const [showProfile, setShowProfile] = useState(false);



  // Détection du mode mobile via hook partagé
  const { settings } = useSettings();

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
            {/* DEBUG supprimé */}
            {/* Message de bienvenue supprimé en mobile */}
            <Badge className={`border ${getRoleBadgeColor(user?.role || '')}`}>
              {user?.role}
            </Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-accent">
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
    </>
  );
};

export default Header;
