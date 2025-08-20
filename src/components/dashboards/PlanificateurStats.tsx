
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { FileText } from 'lucide-react';

interface PlanificateurStatsProps {
  stats: {
    enAttente: number;
  };
  onEnAttenteClick: () => void;
}

const PlanificateurStats = ({ stats, onEnAttenteClick }: PlanificateurStatsProps) => {
  return (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 justify-center">
      <Card 
        className="cursor-pointer hover:shadow-md transition-shadow mx-auto w-full max-w-[400px]"
        onClick={onEnAttenteClick}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">En Attente de Validation</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{stats.enAttente}</div>
          <p className="text-xs text-muted-foreground">Cliquez pour filtrer</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PlanificateurStats;
