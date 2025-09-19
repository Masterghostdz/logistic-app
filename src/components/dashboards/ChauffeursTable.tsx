import React, { useState } from 'react';
import { useSharedData } from '../../contexts/SharedDataContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Chauffeur } from '../../types';
import PasswordField from '../PasswordField';

interface ChauffeurWithStatus extends Chauffeur {
  isEnPanne?: boolean;
  latitude?: number;
  longitude?: number;
  isTracking?: boolean;
  lastPositionAt?: string;
  isOnline?: boolean;
  gpsActive?: boolean;
}

interface ChauffeursTableProps {
  chauffeurs: ChauffeurWithStatus[];
  onEditChauffeur: (chauffeur: Chauffeur) => void;
  onDeleteChauffeur: (id: string) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const ChauffeursTable = ({ chauffeurs, onEditChauffeur, onDeleteChauffeur, fontSize = '100' }: ChauffeursTableProps) => {
  const [localFontSize, setLocalFontSize] = useState(fontSize);
  const { vehicleTypes } = useSharedData();
  const zoomLevels: Record<string, number> = {
    '50': 0.5,
    '60': 0.6,
    '80': 0.8,
    '90': 0.9,
    '100': 1.0
  };
  const zoom = zoomLevels[localFontSize];
  const fontSizeStyle = { fontSize: `${Math.round(14 * zoom)}px` };
  const rowHeight = `h-[${Math.round(40 * zoom)}px]`;
  // iconSize dynamique comme dans DeclarationsTable
  const baseIcon = 18;
  const zoomLevelsGlobal = {
    '50': 0.5,
    '60': 0.6,
    '80': 0.8,
    '90': 0.9,
    '100': 1.0
  };
  const zoomGlobal = zoomLevelsGlobal[String(localFontSize)] ?? 1.0;
  const iconSize = `h-[${Math.round(baseIcon * zoomGlobal)}px] w-[${Math.round(baseIcon * zoomGlobal)}px]`;
  return (
    <Card>
      <CardContent className="p-0">
        {/* Sélecteur de zoom */}
        <div className="flex items-center justify-end mb-2">
          <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
          <select
            value={localFontSize}
            onChange={e => setLocalFontSize(e.target.value as typeof fontSize)}
            className="border rounded px-2 py-1 text-xs bg-background"
            title="Zoom sur la taille d'écriture du tableau"
          >
            <option value="100">100%</option>
            <option value="90">90%</option>
            <option value="80">80%</option>
            <option value="60">60%</option>
            <option value="50">50%</option>
          </select>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={fontSizeStyle}>
              <TableHead className="w-[140px]" style={fontSizeStyle}>Nom complet</TableHead>
              <TableHead className="w-[100px]" style={fontSizeStyle}>Utilisateur</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>Mot de passe</TableHead>
              <TableHead className="w-[120px]" style={fontSizeStyle}>Téléphone</TableHead>
              <TableHead className="w-[100px]" style={fontSizeStyle}>Véhicule</TableHead>
              <TableHead className="w-[60px]" style={fontSizeStyle}>Type</TableHead>
              <TableHead className="w-[120px]" style={fontSizeStyle}>Position</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>GPS</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>Connexion</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>Statut</TableHead>
              <TableHead className="w-[80px]" style={fontSizeStyle}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chauffeurs.map((chauffeur) => {
              // Statut métier uniquement (exemple : En Panne, Actif, Inactif)
              let statut = '-';
              if (chauffeur.isEnPanne) {
                statut = 'En Panne';
              } else if (chauffeur.isActive) {
                statut = 'Actif';
              } else {
                statut = 'Inactif';
              }
              // Statut connexion
              const connexion = chauffeur.isOnline ? 'En ligne' : 'Hors ligne';
              // Map vehicleType ID to name
              const vehicleTypeName = vehicleTypes.find(vt => vt.id === chauffeur.vehicleType)?.name || '-';
              return (
                <TableRow key={chauffeur.id} className={rowHeight} style={fontSizeStyle}>
                  <TableCell className="font-medium" style={fontSizeStyle}>
                    <div className="truncate text-sm" style={fontSizeStyle}>
                      {chauffeur.employeeType === 'externe' ? 'TP - ' : ''}{chauffeur.firstName} {chauffeur.lastName}
                    </div>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <div className="truncate text-sm" style={fontSizeStyle}>{chauffeur.username}</div>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <span className="tracking-widest text-lg select-none" aria-label="Mot de passe masqué" style={fontSizeStyle}>••••••••</span>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <div className="space-y-1" style={fontSizeStyle}>
                      {chauffeur.phone.map((p, index) => (
                        <div key={index} className="text-sm truncate" style={fontSizeStyle}>{p}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <div className="text-sm truncate" style={fontSizeStyle}>{vehicleTypeName}</div>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <Badge 
                      variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}
                      className="text-xs"
                      style={fontSizeStyle}
                    >
                      {chauffeur.employeeType === 'interne' ? 'Int.' : 'Ext.'}
                    </Badge>
                  </TableCell>
                  {/* Position column */}
                  <TableCell style={fontSizeStyle}>
                    {typeof chauffeur.latitude === 'number' && typeof chauffeur.longitude === 'number'
                      ? `${chauffeur.latitude.toFixed(5)}, ${chauffeur.longitude.toFixed(5)}`
                      : '-'}
                  </TableCell>
                  {/* GPS column */}
                  <TableCell style={fontSizeStyle}>
                    <span
                      className="material-icons"
                      title={chauffeur.gpsActive ? 'GPS activé' : 'GPS désactivé'}
                      style={{
                        color: chauffeur.gpsActive ? '#22c55e' : '#ef4444',
                        fontSize: '20px',
                        verticalAlign: 'middle',
                        display: 'inline-block',
                      }}
                    >
                      gps_fixed
                    </span>
                  </TableCell>
                  {/* Connexion column */}
                  <TableCell style={fontSizeStyle}>
                    <span
                      title={chauffeur.isOnline ? 'En ligne' : 'Hors ligne'}
                      style={{
                        display: 'inline-block',
                        width: 14,
                        height: 14,
                        borderRadius: '50%',
                        background: chauffeur.isOnline ? '#22c55e' : '#ef4444',
                        boxShadow: chauffeur.isOnline
                          ? '0 0 8px 2px #22c55e, 0 2px 6px rgba(34,197,94,0.3)'
                          : '0 0 6px 1px #ef4444, 0 2px 6px rgba(239,68,68,0.3)',
                        margin: '0 auto',
                      }}
                    />
                  </TableCell>
                  {/* Statut column */}
                  <TableCell style={fontSizeStyle}>
                    <Badge 
                      className="text-xs"
                      style={fontSizeStyle}
                      variant={statut === 'Actif' ? 'default' : statut === 'En Panne' ? 'destructive' : 'outline'}
                    >
                      {statut}
                    </Badge>
                  </TableCell>
                  <TableCell style={fontSizeStyle}>
                    <div className="flex gap-1" style={fontSizeStyle}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`p-0 ${iconSize} min-w-0`}
                        onClick={() => onEditChauffeur(chauffeur)}
                        title="Modifier"
                      >
                        <Edit className={`${iconSize} min-w-0`} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`p-0 ${iconSize} min-w-0 text-red-600 hover:text-red-700`}
                        onClick={() => onDeleteChauffeur(chauffeur.id)}
                        title="Supprimer"
                      >
                        <Trash2 className={`${iconSize} min-w-0`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ChauffeursTable;
