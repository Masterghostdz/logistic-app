
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../ui/button';
import { ClipboardList, MapPin } from 'lucide-react';

interface ChauffeurSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ChauffeurSidebar = ({ activeTab, onTabChange }: ChauffeurSidebarProps) => {
  const { settings } = useSettings();
  const viewMode = settings.viewMode || 'desktop';
  if (viewMode === 'mobile') {
    return (
      <nav className="flex flex-row justify-center items-center gap-8 py-3 px-4 bg-white dark:bg-gray-900 rounded-full shadow-lg w-full border-2 border-blue-400 dark:border-blue-600 overflow-x-auto">
        <button
          aria-label="Tableau de bord"
          onClick={() => onTabChange('dashboard')}
          className={`rounded-full p-2 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
        >
          <ClipboardList className="h-[22px] w-[22px]" />
        </button>
        <button
          aria-label="Traçage"
          onClick={() => onTabChange('tracage')}
          className={`rounded-full p-2 transition-all ${activeTab === 'tracage' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
        >
          <MapPin className="h-[22px] w-[22px]" />
        </button>
      </nav>
    );
  }
  // Desktop
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

export default ChauffeurSidebar;
