import React, { createContext, useContext, useEffect, useState } from 'react';
import { toast } from '../components/ui/use-toast';
import { getTranslation } from '../lib/translations';
import { useTranslation } from '../hooks/useTranslation';

interface OnlineStatusContextType {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({ isOnline: true });

export const OnlineStatusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const { t } = useTranslation();

  useEffect(() => {
    const lang = (navigator.language || 'fr');
    const handleOnline = () => {
      setIsOnline(true);
      try {
        const msg = (t && typeof t === 'function') ? t('dashboard.online') : getTranslation('dashboard.online', lang);
        // Use semantic success variant
        toast({ title: msg, variant: 'success' });
      } catch (e) {
        // fallback
        const msg = getTranslation('dashboard.online', lang);
        toast({ title: msg, variant: 'success' });
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      try {
        const msg = (t && typeof t === 'function') ? t('dashboard.offline') : getTranslation('dashboard.offline', lang);
        // Use semantic warning variant
        toast({ title: msg, variant: 'warning' });
      } catch (e) {
        const msg = getTranslation('dashboard.offline', lang);
        toast({ title: msg, variant: 'warning' });
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [t]);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};

export const useOnlineStatus = () => useContext(OnlineStatusContext);
