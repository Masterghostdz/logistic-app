import React from 'react';
import { useLoading } from '../contexts/LoadingContext';
import { useTranslation } from '../hooks/useTranslation';

const LoadingOverlay: React.FC = () => {
  const { isLoading, message } = useLoading();
  const { t } = useTranslation();
  if (!isLoading) return null;
  return (
    <div aria-hidden className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 pointer-events-auto">
      <div className="flex flex-col items-center gap-3 p-6 bg-white/90 dark:bg-slate-900/90 rounded shadow">
        <div className="loader w-12 h-12 border-4 border-t-transparent rounded-full animate-spin border-white" />
        {message ? <div className="text-sm text-center text-white">{message}</div> : <div className="text-sm text-white">{t('loading.default') || 'Chargement...'}</div>}
      </div>
    </div>
  );
};

export default LoadingOverlay;
