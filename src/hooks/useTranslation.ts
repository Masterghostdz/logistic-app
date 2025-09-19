
import { useContext } from 'react';
import { SettingsContext } from '../contexts/SettingsContext';
import { getTranslation } from '../lib/translations';

export const useTranslation = () => {
  const { settings } = useContext(SettingsContext);

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
