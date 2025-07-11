
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import MobileHeader from './MobileHeader';
import MobileSidebar from './MobileSidebar';
import Header from './Header';

interface MobileLayoutProps {
  children: React.ReactNode;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
  showSidebar?: boolean;
}

const MobileLayout = ({ 
  children, 
  activeTab = 'dashboard', 
  onTabChange = () => {}, 
  showSidebar = false 
}: MobileLayoutProps) => {
  const { user } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background w-full overflow-x-hidden">
      {/* Mobile Header - only shown on small screens */}
      <div className="md:hidden">
        <MobileHeader />
      </div>

      {/* Desktop Header - only shown on larger screens */}
      <div className="hidden md:block">
        <Header onProfileClick={() => onTabChange('profile')} />
      </div>

      {/* Mobile Sidebar */}
      {showSidebar && user && (
        <MobileSidebar
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          onTabChange={onTabChange}
          userRole={user.role}
        />
      )}

      {/* Main Content - Mobile optimized */}
      <main className="flex-1 w-full px-2 sm:px-4 md:px-6 pb-4 overflow-x-hidden">
        <div className="w-full max-w-full">
          {children}
        </div>
      </main>
    </div>
  );
};

export default MobileLayout;
