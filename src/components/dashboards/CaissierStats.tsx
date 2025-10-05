import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface CashierStatsProps {
  stats: {
    recouvrements: number;
    paymentsPending: number;
    paymentsNoCompany: number;
  };
  showRecouvrements?: boolean;
  showPaymentsPending?: boolean;
  showPaymentsNoCompany?: boolean;
  statusLabels?: {
    recouvrements?: string;
    paymentsPending?: string;
    paymentsNoCompany?: string;
  };
  onRecouvrementsClick: () => void;
  onPaymentsPendingClick?: () => void;
  onPaymentsNoCompanyClick?: () => void;
}

const CaissierStats: React.FC<CashierStatsProps> = ({
  stats,
  showRecouvrements = true,
  showPaymentsPending = true,
  showPaymentsNoCompany = true,
  statusLabels = {},
  onRecouvrementsClick,
  onPaymentsPendingClick,
  onPaymentsNoCompanyClick,
}) => {
  const { t } = useTranslation();

  const numberClass = 'text-xl sm:text-2xl font-extrabold text-center w-full';
  const statusClass = 'text-xs sm:text-base font-semibold text-center w-full mt-1';

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-3 md:grid-cols-3 md:gap-6 justify-center text-center">
      {showRecouvrements && (
        <div
          className="cursor-pointer select-none mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px]"
          onClick={onRecouvrementsClick}
        >
          <div className="p-3 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
            <div className={`${numberClass} text-gray-700 dark:text-gray-200`}>{stats.recouvrements}</div>
            <div className={`${statusClass} whitespace-nowrap text-gray-700 dark:text-gray-200`}>{statusLabels.recouvrements ?? t('dashboard.pending') ?? 'en attente'}</div>
          </div>
        </div>
      )}

      {showPaymentsPending && (
        <div
          className="cursor-pointer select-none mx-auto w-full max-w-[60px] sm:max-w-[100px] md:max-w-[400px]"
          onClick={onPaymentsPendingClick}
        >
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex flex-col items-center justify-center">
            <div className={`${numberClass} text-yellow-700 dark:text-yellow-400`}>{stats.paymentsPending}</div>
            <div className={`${statusClass} whitespace-nowrap text-yellow-700 dark:text-yellow-400`}>{statusLabels.paymentsPending ?? t('dashboard.pending') ?? 'en attente'}</div>
          </div>
        </div>
      )}

      {showPaymentsNoCompany && (
        <div
          className="cursor-pointer select-none mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px]"
          onClick={onPaymentsNoCompanyClick}
          title={t('caissier.paymentsNoCompanyTitle') ?? 'Paiements sans société'}
        >
          <div className="p-3 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 flex flex-col items-center justify-center">
            <div className={`${numberClass} text-violet-700 dark:text-violet-400`}>{stats.paymentsNoCompany}</div>
            <div className={`${statusClass} whitespace-nowrap text-violet-700 dark:text-violet-400`}>{statusLabels.paymentsNoCompany ?? t('caissier.paymentsNoCompanyTitle') ?? 'sans société'}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaissierStats;
