import { Monitor, Smartphone } from 'lucide-react';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { DialogDescription } from './ui/dialog';
import { Button } from './ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { useSettings } from '../contexts/SettingsContext';
import { useTranslation } from '../hooks/useTranslation';
import { Languages, Palette, Sun, Moon } from 'lucide-react';
import { toast } from 'sonner';

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({ open, onOpenChange }) => {
  const handleViewModeChange = (viewMode: 'desktop' | 'mobile') => {
    updateSettings({ viewMode });
    toast.success(t('forms.success'));
  };
  const { settings, updateSettings } = useSettings();
  const { t } = useTranslation();

  const handleLanguageChange = (language: 'fr' | 'en' | 'ar') => {
    updateSettings({ language });
    toast.success(t('forms.success'));
  };

  const handleThemeChange = (theme: 'light' | 'dark') => {
    updateSettings({ theme });
    toast.success(t('forms.success'));
  };

  const languages = [
    { value: 'fr', label: 'Français' },
    { value: 'en', label: 'English' },
    { value: 'ar', label: 'العربية' }
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            {t('settings.title')}
          </DialogTitle>
          <DialogDescription>
            {t('settings.description') || 'Paramétrez votre expérience utilisateur.'}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
        {/* View Mode Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Monitor className="h-4 w-4" />
              <Smartphone className="h-4 w-4" />
              {t('settings.viewMode') || 'Mode d’affichage'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={settings.viewMode === 'desktop' ? 'default' : 'outline'}
                onClick={() => handleViewModeChange('desktop')}
                className="flex items-center gap-2"
              >
                <Monitor className="h-5 w-5" />
                Desktop
              </Button>
              <Button
                variant={settings.viewMode === 'mobile' ? 'default' : 'outline'}
                onClick={() => handleViewModeChange('mobile')}
                className="flex items-center gap-2"
              >
                <Smartphone className="h-5 w-5" />
                Mobile
              </Button>
            </div>
          </CardContent>
        </Card>
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Languages className="h-4 w-4" />
                {t('settings.language')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Label htmlFor="language">{t('settings.language')}</Label>
                <Select value={settings.language} onValueChange={handleLanguageChange}>
                  <SelectTrigger>
                    <SelectValue placeholder={t('settings.language')} />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map(lang => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Theme Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                {settings.theme === 'light' ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
                {t('settings.theme')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <Button
                  variant={settings.theme === 'light' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex items-center gap-2"
                >
                  <Sun className="h-4 w-4" />
                  {t('settings.light')}
                </Button>
                <Button
                  variant={settings.theme === 'dark' ? 'default' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex items-center gap-2"
                >
                  <Moon className="h-4 w-4" />
                  {t('settings.dark')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end">
          <Button onClick={() => onOpenChange(false)}>
            {t('forms.cancel')}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SettingsDialog;
