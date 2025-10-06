import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText } from 'lucide-react';

interface PlanificateurStatsProps {
  stats: {
    enAttente: number;
    enRoute: number;
    enPanne: number;
  };
  onEnAttenteClick: () => void;
  onEnRouteClick?: () => void;
  onEnPanneClick?: () => void;
}

const PlanificateurStats = ({ stats, onEnAttenteClick, onEnRouteClick, onEnPanneClick }: PlanificateurStatsProps & { onEnRouteClick?: () => void; onEnPanneClick?: () => void }) => {
  const { t } = useTranslation();
  // Harmonized icon and text size
  const iconSize = "h-3 w-3 min-w-[0.75rem] min-h-[0.75rem]";
  // Title (label) classes: allow wrapping and keep it compact on small screens
  const titleClass = "text-xs sm:text-sm font-semibold leading-tight w-full whitespace-normal break-words";
  // Numbers: slightly smaller on very small screens so they don't overflow
  const numberClass = "text-lg sm:text-xl md:text-2xl font-extrabold";
  return (
  <div className="grid grid-cols-3 gap-3 md:gap-6 justify-center">
      {/* En Route */}
      <Card
      className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px] border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-0 sm:p-1"
        onClick={onEnRouteClick}
      >
        <CardContent className="p-1 text-center md:text-center min-w-0">
          <div className={numberClass + " text-blue-700 dark:text-blue-400 mx-auto"} aria-hidden>{stats.enRoute}</div>
          <div className={titleClass + " mt-0.5 text-blue-700 dark:text-blue-400"}>{t('dashboard.onRoad')}</div>
          {/* helper text removed on mobile as requested */}
        </CardContent>
      </Card>
      {/* En Attente de Validation */}
      <Card
      className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[110px] sm:max-w-[140px] md:max-w-[400px] border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-0 sm:p-1"
        onClick={onEnAttenteClick}
      >
        <CardContent className="p-1 text-center md:text-center min-w-0">
          <div className={numberClass + " text-yellow-700 dark:text-yellow-400 mx-auto"} aria-hidden>{stats.enAttente}</div>
          <div className={titleClass + " mt-0.5 text-yellow-700 dark:text-yellow-400"}>{t('dashboard.pending')}</div>
          {/* helper text removed on mobile as requested */}
        </CardContent>
      </Card>
      {/* En Panne : n'affiche le cadre que s'il y a des pannes */}
      {stats.enPanne > 0 && (
        <motion.div
          className={
            "cursor-pointer mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px] rounded-lg border border-orange-200 bg-orange-50 dark:bg-orange-900/20 dark:border-orange-800 p-0 sm:p-2 shadow-lg shadow-orange-400/60 transition-shadow duration-200"
          }
          onClick={onEnPanneClick}
          title={t('dashboard.breakdownDetected')}
          animate={{
            opacity: [0, 1, 1, 1, 0],
            boxShadow: [
              "0 0 0 0 rgba(251,146,60,0.0)",
              "0 0 16px 4px rgba(251,146,60,0.55)",
              "0 0 16px 4px rgba(251,146,60,0.55)",
              "0 0 16px 4px rgba(251,146,60,0.55)",
              "0 0 0 0 rgba(251,146,60,0.0)"
            ]
          }}
          transition={{
            duration: 2.2,
            times: [0, 0.2, 0.6, 0.8, 1],
            repeat: Infinity,
            repeatType: "loop",
            ease: "easeInOut"
          }}
        >
    <CardContent className="p-1 text-center md:text-center min-w-0">
      <div className={numberClass + " text-orange-700 dark:text-orange-400 mx-auto"} aria-hidden>{stats.enPanne}</div>
      <div className={titleClass + " mt-0.5 text-orange-700 dark:text-orange-400"}>{t('dashboard.breakdown')}</div>
            {/* helper text removed on mobile as requested */}
          </CardContent>
        </motion.div>
      )}
    </div>
  );
// Ajout de l'animation glow
};

export default PlanificateurStats;
