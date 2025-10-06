import React from 'react';
import { Button } from '../ui/button';
import { ClipboardList, CreditCard, MapPin, Banknote } from 'lucide-react';
import { useTranslation } from '../../hooks/useTranslation';
import { getTranslation } from '../../lib/translations';
import { useSettings } from '../../contexts/SettingsContext';

interface CaissierSidebarProps {
  activeTab: 'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile';
  onTabChange: (tab: 'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile') => void;
}

const CaissierSidebar: React.FC<CaissierSidebarProps> = ({ activeTab, onTabChange }) => {
  const { t } = useTranslation();
  const { settings, updateSettings } = useSettings();
  const isMobile = settings?.viewMode === 'mobile';

  // Use t() so the hook's language settings (and normalization) are applied
  const labelDashboard = t('tabs.dashboard');
  const labelRecouvrement = t('tabs.recouvrement');
  const labelPayment = t('tabs.payment');
  const labelTracage = t('tabs.tracage');

    if (isMobile) {
    return (
  <nav className="flex flex-row justify-center items-center gap-6 py-2 px-3 bg-white dark:bg-gray-900 rounded-full shadow-lg w-full border-2 border-blue-400 dark:border-blue-600 overflow-hidden">
        <button
          aria-label={labelDashboard}
          onClick={() => onTabChange('dashboard')}
          className={`rounded-full p-2 transition-all ${activeTab === 'dashboard' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <ClipboardList className="h-5 w-5" />
        </button>
        <button
          aria-label={labelRecouvrement}
          onClick={() => onTabChange('recouvrement')}
          className={`rounded-full p-2 transition-all ${activeTab === 'recouvrement' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <Banknote className="h-5 w-5" />
        </button>
        <button
          aria-label={labelPayment}
          onClick={() => onTabChange('paiement')}
          className={`rounded-full p-2 transition-all ${activeTab === 'paiement' ? 'bg-blue-600 text-white shadow-lg scale-110' : 'bg-gray-100 text-gray-600'} flex items-center justify-center h-9 w-9`}
        >
          <CreditCard className="h-5 w-5" />
        </button>
        <button
          aria-label={labelTracage}
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
          {labelDashboard}
        </Button>
        <Button
          variant={activeTab === 'recouvrement' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('recouvrement')}
        >
          <Banknote className="mr-2 h-4 w-4" />
          {labelRecouvrement}
        </Button>
        <Button
          variant={activeTab === 'paiement' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('paiement')}
        >
          <CreditCard className="mr-2 h-4 w-4" />
          {labelPayment}
        </Button>
        <Button
          variant={activeTab === 'tracage' ? 'default' : 'ghost'}
          className="w-full justify-start"
          onClick={() => onTabChange('tracage')}
        >
          <MapPin className="mr-2 h-4 w-4" />
          {labelTracage}
        </Button>
      </nav>
      {/* Dev-only language switcher to quickly test translations (hidden in production) */}
      {typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production' && (
        <div className="mt-4 flex gap-2">
          <button
            className={`px-2 py-1 rounded border ${settings.language === 'fr' ? 'bg-blue-600 text-white' : 'bg-transparent'}`}
            onClick={() => updateSettings({ language: 'fr' })}
          >FR</button>
          <button
            className={`px-2 py-1 rounded border ${settings.language === 'ar' ? 'bg-blue-600 text-white' : 'bg-transparent'}`}
            onClick={() => updateSettings({ language: 'ar' })}
          >AR</button>
        </div>
      )}
      {/* Dev debug: show resolved translations to help troubleshoot language issues */}
      {typeof process !== 'undefined' && process.env && process.env.NODE_ENV !== 'production' && (
        <div className="mt-3 text-xs text-muted-foreground">
          <div>Lang: <strong>{settings.language}</strong></div>
          <div>dashboard (t): {t('tabs.dashboard')}</div>
          <div>dashboard (get): {labelDashboard}</div>
          <div>recouvrement (t): {t('tabs.recouvrement')}</div>
          <div>recouvrement (get): {labelRecouvrement}</div>
          <div>payment (t): {t('tabs.payment')}</div>
          <div>payment (get): {labelPayment}</div>
        </div>
      )}
    </div>
  );
};

export default CaissierSidebar;
