import React, { useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import { SharedDataProvider } from './contexts/SharedDataContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ChauffeurDashboard from './components/dashboards/ChauffeurDashboard';
import PlanificateurDashboard from './components/dashboards/PlanificateurDashboard';
import CaissierDashboard from './components/dashboards/CaissierDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';
import { mobileService } from './services/mobileService';
import { OnlineStatusProvider } from './contexts/OnlineStatusContext';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    // Initialize mobile services when app starts
    mobileService.initialize().catch(console.error);
  }, []);

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'chauffeur':
        return <ChauffeurDashboard />;
      case 'planificateur':
        return <PlanificateurDashboard />;
      case 'caissier':
        return <CaissierDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Rôle non reconnu</div>;
    }
  };

  return (
    <SharedDataProvider>
      <OnlineStatusProvider>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
          {renderDashboard()}
        </div>
      </OnlineStatusProvider>
    </SharedDataProvider>
  );
};

const App = () => {
  return (
    <TooltipProvider>
      <SettingsProvider>
        <AuthProvider>
          <Toaster />
          <Sonner />
          <AppContent />
        </AuthProvider>
      </SettingsProvider>
    </TooltipProvider>
  );
};

export default App;
