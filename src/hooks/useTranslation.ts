
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { getTranslation } from '../lib/translations';

export const useTranslation = () => {
  const { settings } = useContext(SettingsContext);
  
  const t = (key: string) => {
    return getTranslation(key, settings.language);
  };
  
  return { t };
};
