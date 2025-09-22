
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
const userAgent: string = navigator.userAgent;
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
  userAgent?: string;
  updateSettings: (newSettings: Partial<Settings>) => void;
  setHeartbeatOnlineInterval: (value: number) => void;
  setHeartbeatGpsInterval: (value: number) => void;
  setHeartbeatPositionInterval: (value: number) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Détection automatique du mode d'affichage
  // userAgent déjà déclaré en haut du fichier
  function detectViewMode() {
    // Check mobile platforms first (Android WebView can contain 'Linux' and be mis-detected)
    if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent)) {
      return 'mobile';
    }
    // If Windows, Mac, Linux, consider desktop
    if (/Windows|Macintosh|Linux/i.test(userAgent)) {
      return 'desktop';
    }
    // Sinon, utilise la taille d'écran
    if (typeof window !== 'undefined' && window.innerWidth < 800) {
      return 'mobile';
    }
    return 'desktop';
  }

  // Read saved settings synchronously so we can apply theme/dir immediately on app entry
  let initialSettings: Settings = {
    language: 'fr',
    theme: 'light',
    viewMode: detectViewMode(),
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
  };

  try {
    const saved = localStorage.getItem('logigrine_settings');
    if (saved) {
      const parsed = JSON.parse(saved);
      initialSettings = {
        ...initialSettings,
        language: parsed.language || initialSettings.language,
        theme: parsed.theme || initialSettings.theme,
        viewMode: detectViewMode() === 'mobile' ? 'mobile' : (parsed.viewMode || initialSettings.viewMode),
        tableFontSize: parsed.tableFontSize || initialSettings.tableFontSize,
        heartbeatOnlineInterval: parsed.heartbeatOnlineInterval || initialSettings.heartbeatOnlineInterval,
        heartbeatGpsInterval: parsed.heartbeatGpsInterval || initialSettings.heartbeatGpsInterval,
        heartbeatPositionInterval: parsed.heartbeatPositionInterval || initialSettings.heartbeatPositionInterval
      } as Settings;
    }
  } catch (err) {
    console.warn('Failed to read saved settings synchronously:', err);
  }

  // Apply theme and direction immediately
  if (initialSettings.theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }
  if (initialSettings.language === 'ar') {
    document.documentElement.dir = 'rtl';
  } else {
    document.documentElement.dir = 'ltr';
  }

  const [settings, setSettings] = useState<Settings>(initialSettings);

  // Met à jour le mode d'affichage à chaque entrée ou changement de taille d'écran
  useEffect(() => {
    function handleResizeOrAgent() {
      const newMode = detectViewMode();
      setSettings(prev => ({ ...prev, viewMode: newMode }));
    }
    window.addEventListener('resize', handleResizeOrAgent);
    handleResizeOrAgent(); // recalcul immédiat à l'entrée
    return () => {
      window.removeEventListener('resize', handleResizeOrAgent);
    };
  }, []);
  const setHeartbeatOnlineEnabled = (value: boolean) => updateSettings({ heartbeatOnlineEnabled: value });
  const setHeartbeatOnlineImmediate = (value: boolean) => updateSettings({ heartbeatOnlineImmediate: value });
  const setHeartbeatGpsEnabled = (value: boolean) => updateSettings({ heartbeatGpsEnabled: value });
  const setHeartbeatGpsImmediate = (value: boolean) => updateSettings({ heartbeatGpsImmediate: value });
  const setHeartbeatPositionEnabled = (value: boolean) => updateSettings({ heartbeatPositionEnabled: value });
  const setHeartbeatPositionImmediate = (value: boolean) => updateSettings({ heartbeatPositionImmediate: value });
  const setGpsActivationRequestEnabled = (value: boolean) => updateSettings({ gpsActivationRequestEnabled: value });

  // Empêche la modification manuelle du mode d'affichage
  useEffect(() => {
    const autoMode = detectViewMode();
    setSettings(prev => ({ ...prev, viewMode: autoMode }));
  }, [userAgent, window.innerWidth]);

  useEffect(() => {
    // Charger les paramètres depuis Firestore puis localStorage
    const fetchSettings = async () => {
      try {
        const { db } = await import('../services/firebaseClient');
        const { doc, getDoc } = await import('firebase/firestore');
        const ref = doc(db, 'admin_settings', 'heartbeat');
        const snap = await getDoc(ref);
        if (snap.exists()) {
          // Merge firestore settings but prefer device-detected mobile view when appropriate
          setSettings((prev) => {
            const merged = { ...prev, ...snap.data() } as any;
            // If device is mobile, ensure viewMode is mobile by default
            if (detectViewMode() === 'mobile') {
              merged.viewMode = 'mobile';
            }
            return merged;
          });
        }
      } catch (err) {
        console.error('Erreur Firestore settings:', err);
      }
      // Charger les paramètres depuis localStorage
      const savedSettings = localStorage.getItem('logigrine_settings');
      if (savedSettings) {
        try {
          const parsedSettings = JSON.parse(savedSettings);
          // Prefer device-detected mobile view when on mobile devices
          const finalViewMode = detectViewMode() === 'mobile' ? 'mobile' : (parsedSettings.viewMode || detectViewMode());
          setSettings((prev) => ({
            ...prev,
            language: parsedSettings.language || 'fr',
            theme: parsedSettings.theme || 'light',
            viewMode: finalViewMode,
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
      userAgent,
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
    // Instead of throwing (which leads to a hard React error), provide a safe fallback
    // and surface a console warning so we can trace which component uses the hook
    // before the provider is mounted.
    console.warn('useSettings used outside SettingsProvider — returning fallback defaults.');
    const fallback: SettingsContextType = {
      settings: {
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
      },
      userAgent,
      updateSettings: () => {},
      setHeartbeatOnlineInterval: () => {},
      setHeartbeatGpsInterval: () => {},
      setHeartbeatPositionInterval: () => {},
      setHeartbeatOnlineEnabled: () => {},
      setHeartbeatOnlineImmediate: () => {},
      setHeartbeatGpsEnabled: () => {},
      setHeartbeatGpsImmediate: () => {},
      setHeartbeatPositionEnabled: () => {},
      setHeartbeatPositionImmediate: () => {},
      setGpsActivationRequestEnabled: () => {}
    };
    return fallback;
  }
  return context;
};

export { SettingsContext };
