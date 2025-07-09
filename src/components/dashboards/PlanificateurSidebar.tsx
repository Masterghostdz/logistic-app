
import React from 'react';
import { Button } from '../ui/button';
import { 
  ClipboardList,
  FileText,
  User,
  MapPin
} from 'lucide-react';

interface PlanificateurSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const PlanificateurSidebar = ({ activeTab, onTabChange }: PlanificateurSidebarProps) => {
  return (
    <div className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 p-4">
      <nav className="space-y-2">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('dashboard')}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          Tableau de bord
        </Button>
        <Button
          variant={activeTab === 'declarations' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('declarations')}
        >
          <FileText className="mr-2 h-4 w-4" />
          Déclarations
        </Button>
        <Button
          variant={activeTab === 'chauffeurs' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('chauffeurs')}
        >
          <User className="mr-2 h-4 w-4" />
          Chauffeurs
        </Button>
        <Button
          variant={activeTab === 'tracage' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('tracage')}
        >
          <MapPin className="mr-2 h-4 w-4" />
          Traçage
        </Button>
      </nav>
    </div>
  );
};

export default PlanificateurSidebar;
