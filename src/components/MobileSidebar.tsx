
import React from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent } from './ui/sheet';
import { 
  ClipboardList,
  FileText,
  User,
  MapPin,
  Home,
  X,
  Package
} from 'lucide-react';

interface MobileSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: string;
  onTabChange: (tab: string) => void;
  userRole: string;
}

const MobileSidebar = ({ isOpen, onClose, activeTab, onTabChange, userRole }: MobileSidebarProps) => {
  const handleTabChange = (tab: string) => {
    onTabChange(tab);
    onClose();
  };

  const getMenuItems = () => {
    const commonItems = [
      { id: 'dashboard', label: 'Tableau de bord', icon: Home }
    ];

    switch (userRole) {
      case 'planificateur':
        return [
          ...commonItems,
          { id: 'declarations', label: 'Déclarations', icon: FileText },
          { id: 'entrepots', label: 'Entrepôts', icon: Package },
          { id: 'chauffeurs', label: 'Chauffeurs', icon: User },
          { id: 'tracage', label: 'Traçage', icon: MapPin }
        ];
      case 'chauffeur':
        return [
          ...commonItems,
          { id: 'declarations', label: 'Mes Déclarations', icon: FileText }
        ];
      case 'financier':
        return [
          ...commonItems,
          { id: 'declarations', label: 'Déclarations', icon: FileText },
          { id: 'reports', label: 'Rapports', icon: ClipboardList }
        ];
      case 'admin':
        return [
          ...commonItems,
          { id: 'users', label: 'Utilisateurs', icon: User },
          { id: 'settings', label: 'Paramètres', icon: ClipboardList }
        ];
      default:
        return commonItems;
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-80 p-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Navigation</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          {getMenuItems().map((item) => {
            const Icon = item.icon;
            return (
              <Button
                key={item.id}
                variant={activeTab === item.id ? 'default' : 'ghost'}
                className="w-full justify-start text-left"
                onClick={() => handleTabChange(item.id)}
              >
                <Icon className="mr-3 h-4 w-4" />
                {item.label}
              </Button>
            );
          })}
        </nav>
      </SheetContent>
    </Sheet>
  );
};

export default MobileSidebar;
