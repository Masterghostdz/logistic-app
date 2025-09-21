
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
  // Responsive: force same size on mobile and desktop
  const iconSize = "h-3 w-3 min-w-[0.75rem] min-h-[0.75rem]";
  // Ultra compact pour mobile
  const titleClass = "text-[8px] sm:text-base font-semibold flex items-center gap-1 leading-tight w-full whitespace-normal break-words";
  const numberClass = "text-xs sm:text-2xl font-extrabold";
  return (
  <div className="grid grid-cols-3 gap-0.5 sm:grid-cols-3 md:grid-cols-3 md:gap-6 justify-center">
      {/* En Route */}
      <Card
  className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[75px] sm:max-w-[120px] md:max-w-[400px] border-blue-200 bg-blue-50 dark:bg-blue-900/20 dark:border-blue-800 p-0 sm:p-2"
        onClick={onEnRouteClick}
      >
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
          <CardTitle className={titleClass + " text-blue-700 dark:text-blue-400"}>
            <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('dashboard.onRoad')}</span>
          </CardTitle>
        </CardHeader>
  <CardContent className="p-0 sm:p-2">
          <div className={numberClass + " text-blue-700 dark:text-blue-400"}>{stats.enRoute}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
        </CardContent>
      </Card>
      {/* En Attente de Validation */}
      <Card
  className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[60px] sm:max-w-[100px] md:max-w-[400px] border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20 dark:border-yellow-800 p-0 sm:p-2"
        onClick={onEnAttenteClick}
      >
  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
          <CardTitle className={titleClass + " text-yellow-700 dark:text-yellow-400"}>
            <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('dashboard.pending')}</span>
          </CardTitle>
        </CardHeader>
  <CardContent className="p-0 sm:p-2">
          <div className={numberClass + " text-yellow-700 dark:text-yellow-400"}>{stats.enAttente}</div>
          <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
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
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-0 p-0 sm:p-2 sm:pb-2">
            <CardTitle className={titleClass + " text-orange-700 dark:text-orange-400"}>
              <span className="truncate w-full block max-w-full whitespace-normal break-words">{t('dashboard.breakdown')}</span>
            </CardTitle>
          </CardHeader>
            <CardContent className="p-0 sm:p-2">
            <div className={numberClass + " text-orange-700 dark:text-orange-400"}>{stats.enPanne}</div>
            <p className="text-xs text-muted-foreground">{t('dashboard.clickToFilter')}</p>
          </CardContent>
        </motion.div>
      )}
    </div>
  );
// Ajout de l'animation glow
};

export default PlanificateurStats;
