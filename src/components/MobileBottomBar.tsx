import React from 'react';
import { Home, ChevronLeft, Grid } from 'lucide-react';

interface MobileBottomBarProps {
  active?: string;
  onNavigate?: (tab: string) => void;
}

const MobileBottomBar: React.FC<MobileBottomBarProps> = ({ active = 'home', onNavigate = () => {} }) => {
  const btn = (tab: string, icon: React.ReactNode, label?: string) => (
    <button
      onClick={() => onNavigate(tab)}
      className={`flex-1 flex flex-col items-center justify-center gap-0 py-2 px-1 focus:outline-none`}
      aria-label={tab}
    >
      <div className={`p-2 rounded-full ${active === tab ? 'bg-primary/10 text-primary' : 'text-muted-foreground'} `}>
        {icon}
      </div>
      <span className="text-[11px] mt-1 text-muted-foreground">{label}</span>
    </button>
  );

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 md:hidden">
      {/* Backdrop + subtle blur to ensure icons remain visible on any content */}
      <div className="backdrop-blur-sm bg-white/60 dark:bg-[#0b1220]/60 border-t border-border">
        <div style={{ paddingBottom: 'env(safe-area-inset-bottom, 12px)' }} className="max-w-4xl mx-auto flex items-center justify-between px-2">
          {btn('back', <ChevronLeft className="h-5 w-5" />, 'Retour')}
          {btn('home', <Home className="h-5 w-5" />, 'Accueil')}
          {btn('tabs', <Grid className="h-5 w-5" />, 'Onglets')}
        </div>
      </div>
    </nav>
  );
};

export default MobileBottomBar;
