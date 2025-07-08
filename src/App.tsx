
import React from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SettingsProvider } from './contexts/SettingsContext';
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import ChauffeurDashboard from './components/dashboards/ChauffeurDashboard';
import PlanificateurDashboard from './components/dashboards/PlanificateurDashboard';
import FinancierDashboard from './components/dashboards/FinancierDashboard';
import AdminDashboard from './components/dashboards/AdminDashboard';

const AppContent = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return <LoginForm />;
  }

  const renderDashboard = () => {
    switch (user.role) {
      case 'chauffeur':
        return <ChauffeurDashboard />;
      case 'planificateur':
        return <PlanificateurDashboard />;
      case 'financier':
        return <FinancierDashboard />;
      case 'admin':
        return <AdminDashboard />;
      default:
        return <div>Rôle non reconnu</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="flex-1">
        {renderDashboard()}
      </main>
    </div>
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
