
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Settings } from '../types';

interface SettingsContextType {
  setHeartbeatOnlineEnabled?: (value: boolean) => void;
  setHeartbeatOnlineImmediate?: (value: boolean) => void;
  setHeartbeatGpsEnabled?: (value: boolean) => void;
  setHeartbeatGpsImmediate?: (value: boolean) => void;
  setHeartbeatPositionEnabled?: (value: boolean) => void;
  setHeartbeatPositionImmediate?: (value: boolean) => void;
  setGpsActivationRequestEnabled?: (value: boolean) => void;
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  setHeartbeatOnlineInterval: (value: number) => void;
  setHeartbeatGpsInterval: (value: number) => void;
  setHeartbeatPositionInterval: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Settings>({
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
  });
  const setHeartbeatOnlineEnabled = (value: boolean) => updateSettings({ heartbeatOnlineEnabled: value });
  const setHeartbeatOnlineImmediate = (value: boolean) => updateSettings({ heartbeatOnlineImmediate: value });
  const setHeartbeatGpsEnabled = (value: boolean) => updateSettings({ heartbeatGpsEnabled: value });
  const setHeartbeatGpsImmediate = (value: boolean) => updateSettings({ heartbeatGpsImmediate: value });
  const setHeartbeatPositionEnabled = (value: boolean) => updateSettings({ heartbeatPositionEnabled: value });
  const setHeartbeatPositionImmediate = (value: boolean) => updateSettings({ heartbeatPositionImmediate: value });
  const setGpsActivationRequestEnabled = (value: boolean) => updateSettings({ gpsActivationRequestEnabled: value });

  useEffect(() => {
    // Charger les paramètres depuis Firestore puis localStorage
    const fetchSettings = async () => {
      try {
        const { db } = await import('../services/firebaseClient');
        const { doc, getDoc } = await import('firebase/firestore');
        const ref = doc(db, 'admin_settings', 'heartbeat');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setSettings((prev) => ({ ...prev, ...snap.data() }));
        }
      } catch (err) {
        console.error('Erreur Firestore settings:', err);
      }
      // Charger les paramètres depuis localStorage
      const savedSettings = localStorage.getItem('logigrine_settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          setSettings((prev) => ({
            ...prev,
            language: parsedSettings.language || 'fr',
            theme: parsedSettings.theme || 'light',
            viewMode: parsedSettings.viewMode || 'desktop',
            tableFontSize: parsedSettings.tableFontSize || '80',
            heartbeatOnlineInterval: parsedSettings.heartbeatOnlineInterval || 60,
            heartbeatGpsInterval: parsedSettings.heartbeatGpsInterval || 60,
            heartbeatPositionInterval: parsedSettings.heartbeatPositionInterval || 60,
          }));
          // Appliquer le thème
          if (parsedSettings.theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
          // Appliquer la direction RTL pour l'arabe
          if (parsedSettings.language === 'ar') {
            document.documentElement.dir = 'rtl';
          } else {
            document.documentElement.dir = 'ltr';
          }
        } catch (error) {
          console.error('Error parsing saved settings:', error);
        }
      }
    };
    fetchSettings();
  }, []);

  const updateSettings = (newSettings: Partial<Settings>) => {
  const updatedSettings = { ...settings, ...newSettings };
  setSettings(updatedSettings);
  localStorage.setItem('logigrine_settings', JSON.stringify(updatedSettings));
    
    // Appliquer les changements
    if (newSettings.theme) {
      if (newSettings.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    if (newSettings.language) {
      if (newSettings.language === 'ar') {
        document.documentElement.dir = 'rtl';
      } else {
        document.documentElement.dir = 'ltr';
      }
    }
  };

  // Ajout setters pour chaque intervalle
  const setHeartbeatOnlineInterval = (value: number) => updateSettings({ heartbeatOnlineInterval: value });
  const setHeartbeatGpsInterval = (value: number) => updateSettings({ heartbeatGpsInterval: value });
  const setHeartbeatPositionInterval = (value: number) => updateSettings({ heartbeatPositionInterval: value });

  return (
    <SettingsContext.Provider value={{
      settings,
      updateSettings,
      setHeartbeatOnlineInterval,
      setHeartbeatGpsInterval,
      setHeartbeatPositionInterval,
      setHeartbeatOnlineEnabled,
      setHeartbeatOnlineImmediate,
      setHeartbeatGpsEnabled,
      setHeartbeatGpsImmediate,
      setHeartbeatPositionEnabled,
      setHeartbeatPositionImmediate,
      setGpsActivationRequestEnabled
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

export { SettingsContext };
