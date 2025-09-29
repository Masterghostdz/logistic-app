import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';

interface CashierStatsProps {
  stats: {
    recouvrements: number;
    paymentsPending: number;
    paymentsNoCompany: number;
  };
  onRecouvrementsClick: () => void;
  onPaymentsPendingClick?: () => void;
  onPaymentsNoCompanyClick?: () => void;
}

const CaissierStats = ({ stats, onRecouvrementsClick, onPaymentsPendingClick, onPaymentsNoCompanyClick }: CashierStatsProps) => {
  const { t } = useTranslation();
  // Reuse the same sizing and spacing as PlanificateurStats
  const titleClass = "text-[8px] sm:text-base font-semibold flex items-center gap-1 leading-tight w-full whitespace-normal break-words";
  const numberClass = "text-xs sm:text-2xl font-extrabold";

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-3 md:grid-cols-3 md:gap-6 justify-center">
      {/* Recouvrements (use same gray tone as "Non Recouvré" badge in DeclarationsTable) */}
      <Card
        className="cursor-pointer transition-shadow mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px] rounded-lg border border-gray-200 bg-gray-50 dark:bg-gray-900/20 dark:border-gray-700 p-0 sm:p-2"
        onClick={onRecouvrementsClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
          <CardTitle className={titleClass + " text-gray-700 dark:text-gray-200"}>
            <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('caissier.recouvrementsTitle') || 'Recouvrements en attente'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 px-[10px]">
          <div className={numberClass + " text-gray-700 dark:text-gray-200"}>{stats.recouvrements}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
        </CardContent>
      </Card>

      {/* Paiements non validés (yellow) */}
      <Card
        className="cursor-pointer transition-shadow mx-auto w-full max-w-[60px] sm:max-w-[100px] md:max-w-[400px] border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-0 sm:p-2"
        onClick={onPaymentsPendingClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
          <CardTitle className={titleClass + " text-yellow-700 dark:text-yellow-400"}>
            <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('caissier.paymentsPendingTitle') || 'Paiements non validés'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 px-[10px]">
          <div className={numberClass + " text-yellow-700 dark:text-yellow-400"}>{stats.paymentsPending}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
        </CardContent>
      </Card>

      {/* Paiements sans société — always shown; distinct color (violet) for emphasis, static (no blinking) */}
      <Card
        className="cursor-pointer transition-shadow mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px] rounded-lg border border-violet-200 bg-violet-50 dark:bg-violet-900/20 dark:border-violet-800 p-0 sm:p-2"
        onClick={onPaymentsNoCompanyClick}
        title={t('caissier.paymentsNoCompanyTitle') || 'Paiements sans société'}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
          <CardTitle className={titleClass + " text-violet-700 dark:text-violet-400"}>
            <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('caissier.paymentsNoCompanyTitle') || 'Paiements sans société'}</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 sm:p-2 px-[10px]">
          <div className={numberClass + " text-violet-700 dark:text-violet-400"}>{stats.paymentsNoCompany}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CaissierStats;
