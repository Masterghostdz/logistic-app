import React from 'react';
import { Button } from '../ui/button';
import { ClipboardList, CreditCard, MapPin, Banknote } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { useSettings } from '../../contexts/SettingsContext';

interface CaissierSidebarProps {
  activeTab: 'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile';
  onTabChange: (tab: 'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile') => void;
}

const CaissierSidebar: React.FC<CaissierSidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { settings } = useSettings();
  const isMobile = settings?.viewMode === 'mobile';

  if (isMobile) {
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
          aria-label="Recouvrement"
          onClick={() => onTabChange('recouvrement')}
          className={`rounded-full p-2 transition-all ${activeTab === 'recouvrement' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
        >
          <Banknote className="h-[22px] w-[22px]" />
        </button>
        <button
          aria-label="Paiement"
          onClick={() => onTabChange('paiement')}
          className={`rounded-full p-2 transition-all ${activeTab === 'paiement' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-10 w-10`}
        >
          <CreditCard className="h-[22px] w-[22px]" />
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
          {t('tabs.dashboard') || 'Tableau de bord'}
        </Button>
        <Button
          variant={activeTab === 'recouvrement' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('recouvrement')}
        >
          <Banknote className="mr-2 h-4 w-4" />
          {t('tabs.recouvrement') || 'Recouvrement'}
        </Button>
        <Button
          variant={activeTab === 'paiement' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('paiement')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {t('tabs.payment') || 'Paiement'}
        </Button>
        <Button
          variant={activeTab === 'tracage' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('tracage')}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {t('tabs.tracage') || 'Traçage'}
        </Button>
      </nav>
    </div>
  );
};

export default CaissierSidebar;
