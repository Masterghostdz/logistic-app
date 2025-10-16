import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';

interface CashierStatsProps {
  stats: {
    recouvrements: number;
    paymentsPending: number;
    paymentsNoCompany: number;
    paymentsNotReceived?: number;
    paymentsValidated?: number;
    recouvrementsNotReceived?: number;
  };
  showRecouvrements?: boolean;
  showPaymentsPending?: boolean;
  showPaymentsNoCompany?: boolean;
  showPaymentsNotReceived?: boolean;
  showPaymentsValidated?: boolean;
  showRecouvrementsNotReceived?: boolean;
  statusLabels?: {
    recouvrements?: string;
    paymentsPending?: string;
    paymentsNoCompany?: string;
    paymentsNotReceived?: string;
    paymentsValidated?: string;
    recouvrementsNotReceived?: string;
  };
  onRecouvrementsClick: () => void;
  onPaymentsPendingClick?: () => void;
  onPaymentsNoCompanyClick?: () => void;
  onPaymentsNotReceivedClick?: () => void;
  onPaymentsValidatedClick?: () => void;
  onRecouvrementsNotReceivedClick?: () => void;
}

const CaissierStats: React.FC<CashierStatsProps> = ({
  stats,
  showRecouvrements = true,
  showPaymentsPending = true,
  showPaymentsNoCompany = true,
  showPaymentsNotReceived = false,
  showPaymentsValidated = false,
  showRecouvrementsNotReceived = false,
  statusLabels = {},
  onRecouvrementsClick,
  onPaymentsPendingClick,
  onPaymentsNoCompanyClick,
  onPaymentsNotReceivedClick,
  onPaymentsValidatedClick,
  onRecouvrementsNotReceivedClick,
}) => {
  const { t } = useTranslation();

  // Harmonisation avec PlanificateurStats
  const numberClass = 'text-lg sm:text-xl md:text-2xl font-extrabold text-center w-full';
  const statusClass = 'text-xs sm:text-sm font-semibold leading-tight w-full whitespace-normal break-words mt-0.5';

  // determine visible tiles so we can layout grid accordingly (always 3 slots per card)
  const visibleTilesCount = [showRecouvrements, showRecouvrementsNotReceived, showPaymentsPending, showPaymentsNotReceived, showPaymentsValidated, showPaymentsNoCompany].filter(Boolean).length;
  const visibleTiles = 3;

  // Build the list of rendered tiles
  const tiles = [];
  if (showRecouvrements) {
    tiles.push(
      <div
        key="recouvrements"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onRecouvrementsClick}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-gray-50 dark:bg-gray-900/20 rounded-lg border border-gray-200 dark:border-gray-700 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-gray-700 dark:text-gray-200`}>{stats.recouvrements}</div>
          <div className={`${statusClass} text-gray-700 dark:text-gray-200`}>{statusLabels.recouvrements ?? t('dashboard.pending') ?? 'en attente'}</div>
        </div>
      </div>
    );
  }
  if (showRecouvrementsNotReceived) {
    tiles.push(
      <div
        key="recouvrementsNotReceived"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onRecouvrementsNotReceivedClick}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-rose-50 dark:bg-rose-900/20 rounded-lg border border-rose-200 dark:border-rose-800 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-rose-700 dark:text-rose-400`}>{stats.recouvrementsNotReceived ?? 0}</div>
          <div className={`${statusClass} text-rose-700 dark:text-rose-400`}>{statusLabels.recouvrementsNotReceived ?? t('caissier.notReceived') ?? 'Non Reçu'}</div>
        </div>
      </div>
    );
  }
  if (showPaymentsPending) {
    tiles.push(
      <div
        key="paymentsPending"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onPaymentsPendingClick}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-yellow-700 dark:text-yellow-400`}>{stats.paymentsPending}</div>
          <div className={`${statusClass} text-yellow-700 dark:text-yellow-400`}>{statusLabels.paymentsPending ?? t('dashboard.pending') ?? 'en attente'}</div>
        </div>
      </div>
    );
  }
  if (showPaymentsNoCompany) {
    tiles.push(
      <div
        key="paymentsNoCompany"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onPaymentsNoCompanyClick}
        title={t('caissier.paymentsNoCompanyTitle') ?? 'Paiements sans société'}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-violet-50 dark:bg-violet-900/20 rounded-lg border border-violet-200 dark:border-violet-800 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-violet-700 dark:text-violet-400`}>{stats.paymentsNoCompany}</div>
          <div className={`${statusClass} text-violet-700 dark:text-violet-400`}>{statusLabels.paymentsNoCompany ?? t('caissier.paymentsNoCompanyTitle') ?? 'sans société'}</div>
        </div>
      </div>
    );
  }
  if (showPaymentsNotReceived) {
    tiles.push(
      <div
        key="paymentsNotReceived"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onPaymentsNotReceivedClick}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-sky-50 dark:bg-sky-900/20 rounded-lg border border-sky-200 dark:border-sky-800 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-sky-700 dark:text-sky-400`}>{stats.paymentsNotReceived ?? 0}</div>
          <div className={`${statusClass} text-sky-700 dark:text-sky-400`}>{statusLabels.paymentsNotReceived ?? t('caissier.notReceived') ?? 'Non Reçu'}</div>
        </div>
      </div>
    );
  }
  if (showPaymentsValidated) {
    tiles.push(
      <div
        key="paymentsValidated"
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]"
        onClick={onPaymentsValidatedClick}
      >
        <div className="p-1 text-center md:text-center min-w-0 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg border border-emerald-200 dark:border-emerald-800 flex flex-col items-center justify-center">
          <div className={`${numberClass} text-emerald-700 dark:text-emerald-400`}>{stats.paymentsValidated ?? 0}</div>
          <div className={`${statusClass} text-emerald-700 dark:text-emerald-400`}>{statusLabels.paymentsValidated ?? t('caissier.paymentsValidatedTitle') ?? 'Validés'}</div>
        </div>
      </div>
    );
  }

  // Fill up to 3 tiles with empty placeholders if needed
  while (tiles.length < 3) {
    tiles.push(
      <div key={`empty-${tiles.length}`} className="mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px]">
        {/* empty slot, preserves layout */}
      </div>
    );
  }

  return (
    <div className="grid gap-3 md:gap-6 justify-center" style={{ gridTemplateColumns: `repeat(${visibleTiles}, minmax(0, 1fr))` }}>
      {tiles}
    </div>
  );
};

export default CaissierStats;
