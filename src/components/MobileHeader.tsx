
import React, { useState } from 'react';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';
import { Menu, User, Sun, Moon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from '../hooks/useTranslation';
import { useTheme } from 'next-themes';

const MobileHeader = () => {
  const { user, logout } = useAuth();
  const { t } = useTranslation();
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <header className="bg-background border-b border-border p-4 md:hidden">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-primary">Logigrine</h1>
        
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="p-2"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>

          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                <Menu className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-80">
              <div className="py-4">
                <div className="flex items-center gap-3 pb-4 border-b border-border">
                  <div className="bg-primary text-primary-foreground w-10 h-10 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="font-medium">{user?.fullName}</div>
                    <div className="text-sm text-muted-foreground capitalize">
                      {t(`roles.${user?.role}`) || user?.role}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4 space-y-2">
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                  >
                    Se déconnecter
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
};

export default MobileHeader;
