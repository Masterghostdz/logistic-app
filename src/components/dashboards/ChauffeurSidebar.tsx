
import React from 'react';
import { useSettings } from '../../contexts/SettingsContext';
import { useTranslation } from '../../hooks/useTranslation';
import { Button } from '../ui/button';
import { ClipboardList, MapPin } from 'lucide-react';

interface ChauffeurSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const ChauffeurSidebar = ({ activeTab, onTabChange }: ChauffeurSidebarProps) => {
  const { settings } = useSettings();
  const viewMode = settings.viewMode || 'desktop';
  const { t } = useTranslation();
  if (viewMode === 'mobile') {
    return (
      <nav className="flex flex-row justify-center items-center gap-6 py-2 px-3 bg-white dark:bg-gray-900 rounded-full shadow-lg w-full border-2 border-blue-400 dark:border-blue-600 overflow-hidden">
        <button
          aria-label="Tableau de bord"
          onClick={() => onTabChange('dashboard')}
          className={`rounded-full p-2 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <ClipboardList className="h-5 w-5" />
        </button>
        <button
          aria-label="Traçage"
          onClick={() => onTabChange('tracage')}
          className={`rounded-full p-2 transition-all ${activeTab === 'tracage' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <MapPin className="h-5 w-5" />
        </button>
      </nav>
    );
  }
  // Desktop
  return (
  <div className="w-64 flex-shrink-0 bg-gray-50 dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 p-4 z-50 relative">
      <nav className="space-y-2">
        <Button
          variant={activeTab === 'dashboard' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('dashboard')}
        >
          <ClipboardList className="mr-2 h-4 w-4" />
          {t('tabs.dashboard')}
        </Button>
        <Button
          variant={activeTab === 'tracage' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('tracage')}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {t('tabs.tracage')}
        </Button>
      </nav>
    </div>
  );
};

export default ChauffeurSidebar;
