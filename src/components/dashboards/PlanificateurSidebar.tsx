import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../contexts/SettingsContext';
import { Button } from '../ui/button';
import { 
  ClipboardList,
  FileText,
  User,
  MapPin,
  Warehouse
} from 'lucide-react';

interface PlanificateurSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  hasPendingClients?: boolean;
}

const PlanificateurSidebar = ({ activeTab, onTabChange, hasPendingClients }: PlanificateurSidebarProps) => {
  // Utilise le paramètre settings.viewMode pour le mode mobile/desktop
  const { settings } = useSettings();
  const viewMode = settings.viewMode || 'desktop';
  const { t } = useTranslation();
  console.log('Sidebar language:', settings.language);
    if (viewMode === 'mobile') {
    return (
  <nav className="flex flex-row justify-center items-center gap-6 py-2 px-3 bg-white dark:bg-gray-900 rounded-full shadow-lg w-full border-2 border-blue-400 dark:border-blue-600 overflow-hidden">
        <button
          aria-label={t('tabs.dashboard')}
          onClick={() => onTabChange('dashboard')}
          className={`rounded-full p-2 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <ClipboardList className="h-5 w-5" />
        </button>
        <button
          aria-label={t('tabs.declarations')}
          onClick={() => onTabChange('declarations')}
          className={`rounded-full p-2 transition-all ${activeTab === 'declarations' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <FileText className="h-5 w-5" />
        </button>
        <button
          aria-label={t('tabs.warehouses')}
          onClick={() => onTabChange('entrepots')}
          className={`rounded-full p-2 transition-all ${activeTab === 'entrepots' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <Warehouse className="h-5 w-5" />
        </button>
        <button
          aria-label={t('tabs.chauffeurs')}
          onClick={() => onTabChange('chauffeurs')}
          className={`rounded-full p-2 transition-all ${activeTab === 'chauffeurs' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          {/* Icone Lucide Truck adaptée véhicule marchandise */}
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
        </button>
        <button
          aria-label={t('tabs.clients')}
          onClick={() => onTabChange('clients')}
          className={`relative rounded-full p-2 transition-all flex items-center justify-center h-9 w-9
            ${activeTab === 'clients' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'}
            ${hasPendingClients ? 'ring-2 ring-orange-300/40 ring-offset-2 ring-offset-white shadow-[0_0_12px_4px_rgba(251,146,60,0.85)] animate-pulse' : ''}`}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="2" /><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" strokeWidth="2" /></svg>
          {/* Point orange supprimé */}
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
  // Desktop classique
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
          variant={activeTab === 'declarations' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('declarations')}
        >
          <FileText className="mr-2 h-4 w-4" />
          {t('tabs.declarations')}
        </Button>
        <Button
          variant={activeTab === 'entrepots' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('entrepots')}
        >
          <Warehouse className="mr-2 h-4 w-4" />
          {t('tabs.warehouses')}
        </Button>
        <Button
          variant={activeTab === 'chauffeurs' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('chauffeurs')}
        >
          {/* Icone Lucide Truck adaptée véhicule marchandise */}
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/></svg>
          {t('tabs.chauffeurs')}
        </Button>
        <Button
          variant={activeTab === 'clients' ? 'default' : 'ghost'}
          className={`w-full justify-start relative ${hasPendingClients ? 'ring-2 ring-orange-300/40 ring-offset-2 ring-offset-white shadow-[0_0_12px_4px_rgba(251,146,60,0.85)] animate-pulse' : ''}`}
          onClick={() => onTabChange('clients')}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="8" r="4" strokeWidth="2" /><path d="M4 20c0-2.5 3.5-4 8-4s8 1.5 8 4" strokeWidth="2" /></svg>
          {t('tabs.clients')}
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

export default PlanificateurSidebar;
