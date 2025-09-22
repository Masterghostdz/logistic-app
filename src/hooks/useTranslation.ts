
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { getTranslation } from '../lib/translations';

export const useTranslation = () => {
  const context = useContext(SettingsContext);

  // If the SettingsProvider is not mounted yet, return a safe fallback
  // This prevents runtime crashes when components are rendered outside the provider
  if (!context) {
    console.warn('useTranslation used outside SettingsProvider — returning fallback translations.');
    const fallbackSettings = {
      language: 'fr',
      theme: 'light',
      viewMode: 'desktop',
      tableFontSize: '80',
      heartbeatOnlineInterval: 60,
      heartbeatGpsInterval: 60,
      heartbeatPositionInterval: 60,
      heartbeatOnlineEnabled: true,
      heartbeatOnlineImmediate: true,
      heartbeatGpsEnabled: true,
      heartbeatGpsImmediate: true,
      heartbeatPositionEnabled: true,
      heartbeatPositionImmediate: true,
      gpsActivationRequestEnabled: true
    } as any;

    const t = (key: string, vars?: Record<string, string>) => {
      let str = getTranslation(key, (fallbackSettings as any).language || 'fr');
      if (vars) {
        Object.keys(vars).forEach(k => {
          str = str.replace(`{${k}}`, vars[k]);
        });
      }
      return str;
    };

    return { t, settings: fallbackSettings };
  }

  const { settings } = context;

  const t = (key: string, vars?: Record<string, string>) => {
    let str = getTranslation(key, settings.language);
    if (vars) {
      Object.keys(vars).forEach(k => {
        str = str.replace(`{${k}}`, vars[k]);
      });
    }
    return str;
  };

  return { t, settings };
};
