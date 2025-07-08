
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import LoginForm from '../components/LoginForm';
import ChauffeurDashboard from '../components/dashboards/ChauffeurDashboard';
import PlanificateurDashboard from '../components/dashboards/PlanificateurDashboard';
import FinancierDashboard from '../components/dashboards/FinancierDashboard';
import AdminDashboard from '../components/dashboards/AdminDashboard';
import Header from '../components/Header';

const Index = () => {
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

export default Index;
