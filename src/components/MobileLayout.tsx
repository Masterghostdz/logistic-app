
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
    <div className="min-h-screen bg-background">
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

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
};

export default MobileLayout;
