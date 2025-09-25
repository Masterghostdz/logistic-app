import React, { useState } from 'react';
import Header from '../Header';
import { Badge, onlineBadgeClass, onlineBadgeInline } from '../ui/badge';
import CaissierSidebar from './CaissierSidebar';
import useTableZoom from '../../hooks/useTableZoom';
import { useOnlineStatus } from '../../contexts/OnlineStatusContext';
import { useTranslation } from '../../hooks/useTranslation';
import PaymentReceiptsTable from './PaymentReceiptsTable';
import { PaymentReceipt } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import CreatePaymentDialog from './CreatePaymentDialog';
import ConsultPaymentDialog from './ConsultPaymentDialog';
import { Button } from '../ui/button';
import { Plus } from 'lucide-react';

const CaissierDashboard = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'recouvrement' | 'paiement' | 'tracage' | 'profile'>('dashboard');
  const [showCreatePayment, setShowCreatePayment] = useState(false);
  const { badgeClass, badgeStyle } = useTableZoom();
  const { isOnline } = useOnlineStatus();
  const { t, settings } = useTranslation();
  const isMobile = settings?.viewMode === 'mobile';
  const tabOrder: Array<'dashboard' | 'paiement' | 'tracage' | 'profile'> = ['dashboard', 'paiement', 'tracage', 'profile'];

  // Connexion dynamique Firestore
  const { declarations } = useSharedData();
  // Extraction de tous les reçus de paiement
  const receipts = declarations.flatMap(d => d.paymentReceipts || []);
  
  const [consultReceipt, setConsultReceipt] = React.useState<PaymentReceipt | null>(null);

  // Gestion du profil (mobile et desktop)
  if (activeTab === 'profile') {
    if (isMobile) {
      // En mobile, pas de Header global, profil centré
      return (
        <div className="max-w-[430px] mx-auto bg-background min-h-screen flex flex-col">
          <div className="p-6">
            <div className="text-center text-muted-foreground">Profil Caissier</div>
          </div>
        </div>
      );
    }
    // Desktop : Header global + contenu profil centré
    return (
      <div>
        <Header onProfileClick={() => setActiveTab('dashboard')} />
        <div className="p-6">
          <div className="text-center text-muted-foreground">Profil Caissier</div>
        </div>
      </div>
    );
  }

  return (
    <div className={isMobile ? 'max-w-[430px] mx-auto bg-background min-h-screen flex flex-col' : 'min-h-screen bg-background w-full overflow-x-hidden'}>
      <Header onProfileClick={() => setActiveTab('profile')} />
      {/* Badge en ligne : mobile affiché sous le Header, desktop positionné en absolute dans le conteneur principal (évite bande/floating) */}
      {isMobile && (
        <div
          className={`flex px-2 pt-3 mb-2 items-center gap-2 ${settings.language === 'ar' ? 'justify-start flex-row-reverse' : ''}`}
        >
          <Badge
            style={{ ...badgeStyle, ...onlineBadgeInline }}
            className={`${badgeClass} items-center gap-2 font-semibold ${onlineBadgeClass} shadow`}
            title={isOnline ? t('dashboard.online') : t('dashboard.offline')}
          >
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
            {isOnline ? t('dashboard.online') : t('dashboard.offline')}
          </Badge>
        </div>
      )}
      {/* Layout desktop : sidebar à gauche, main à droite, padding et scroll identiques chauffeur/planificateur */}
      <div className={isMobile ? 'flex flex-col flex-1' : 'flex min-h-[calc(100vh-4rem)] relative'}>
        {/* Badge en desktop: placé en absolute dans le conteneur relatif pour éviter tout impact sur le flux */}
        {!isMobile && (
          <div className={`absolute top-0 ${settings.language === 'ar' ? 'left-0' : 'right-0'} m-2 z-10`}>
            <Badge size="md" style={{ ...badgeStyle, ...onlineBadgeInline }} className={`${badgeClass} items-center gap-2 font-semibold ${onlineBadgeClass} shadow`} title={isOnline ? t('dashboard.online') : t('dashboard.offline')}>
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500"></span>
              {isOnline ? t('dashboard.online') : t('dashboard.offline')}
            </Badge>
          </div>
        )}
        <CaissierSidebar
          activeTab={activeTab}
          onTabChange={tab => setActiveTab(tab as 'dashboard' | 'paiement' | 'tracage' | 'profile')}
        />
        <main className="flex-1 min-w-0 p-6 pt-16 overflow-auto">
          {/* Affichage façade selon la tab sélectionnée */}
          {activeTab === 'dashboard' && (
            <div className="text-muted-foreground">Espace Caissier (façade, aucun contenu)</div>
          )}
          {activeTab === 'recouvrement' && (
            <div className="text-muted-foreground">Section Recouvrement (façade, aucun contenu)</div>
          )}
          {activeTab === 'paiement' && (
            <div className="space-y-6 w-full">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-2xl font-bold">{t('caissier.paymentsTitle') || 'Paiements'}</h2>
                {/* placeholder for actions (export, add, etc.) if needed in future */}
                <div className="flex items-center gap-2">
                  <Button onClick={() => setShowCreatePayment(true)} className="flex items-center gap-2">
                    <Plus className="h-4 w-4" />
                    {t('buttons.add') || 'Ajouter'}
                  </Button>
                </div>
              </div>
              <div className={(isMobile ? 'overflow-x-auto ' : '') + 'mb-2'}>
                <PaymentReceiptsTable receipts={receipts} onConsultReceipt={(r) => setConsultReceipt(r)} />
              </div>
              <ConsultPaymentDialog isOpen={!!consultReceipt} receipt={consultReceipt} onClose={() => setConsultReceipt(null)} />
              <CreatePaymentDialog isOpen={showCreatePayment} onClose={() => setShowCreatePayment(false)} />
            </div>
          )}
          {activeTab === 'tracage' && (
            <div className="text-muted-foreground">Section Tracage (façade, aucun contenu)</div>
          )}
          {/* Le profil est géré par le bloc conditionnel principal, donc pas besoin ici */}
        </main>
      </div>
    </div>
  );
};

export default CaissierDashboard;
