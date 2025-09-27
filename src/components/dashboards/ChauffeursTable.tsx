import React from 'react';
import { useSharedData } from '../../contexts/SharedDataContext';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Chauffeur } from '../../types';
import PasswordField from '../PasswordField';
import { useTranslation } from '../../hooks/useTranslation';
import useTableZoom from '../../hooks/useTableZoom';

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
  showPosition?: boolean;
}

const ChauffeursTable = ({ chauffeurs, onEditChauffeur, onDeleteChauffeur, fontSize = '80', showPosition = true }: ChauffeursTableProps) => {
  const { localFontSize, setLocalFontSize, fontSizeStyle, rowHeight, iconSize, cellPaddingClass, badgeClass, badgeStyle, getMinWidthForChars, computedRowPx, computedIconPx } = useTableZoom(fontSize as any);
  const { vehicleTypes } = useSharedData();
  const { t, settings } = useTranslation();
  return (
    <Card>
      <CardContent className="p-0">
        {/* Sélecteur de zoom */}
        <div className="flex items-center justify-end mb-2">
          <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
          <select
            value={localFontSize}
            onChange={e => setLocalFontSize(e.target.value as any)}
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
        <Table data-rtl={settings.language === 'ar'}>
          <TableHeader dir={settings.language === 'ar' ? 'rtl' : 'ltr'} data-rtl={settings.language === 'ar'}>
            <TableRow style={fontSizeStyle}>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(20)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.fullName')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(10)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.username')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(8)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('forms.password') /* Mot de passe */}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.phone')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.vehicleType')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(8)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.employeeType')}</TableHead>
              {showPosition ? (
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.position')}</TableHead>
              ) : null}
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(6)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.gps') || 'GPS'}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(8)} ${cellPaddingClass} text-center`} style={fontSizeStyle}>{t('chauffeurs.connexion') || t('dashboard.online')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(10)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.status')}</TableHead>
              <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(10)} ${cellPaddingClass}`} style={fontSizeStyle}>{t('chauffeurs.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody dir={settings.language === 'ar' ? 'rtl' : 'ltr'} data-rtl={settings.language === 'ar'}>
            {chauffeurs.map((chauffeur) => {
              // Statut métier uniquement (exemple : En Panne, Actif, Inactif)
              const statutEnPanne = t('chauffeurs.enPanne') || 'En Panne';
              const statutActif = t('chauffeurs.active') || 'Actif';
              const statutInactif = t('chauffeurs.inactive') || 'Inactif';
              let statut = '-';
              if (chauffeur.isEnPanne) {
                statut = statutEnPanne;
              } else if (chauffeur.isActive) {
                statut = statutActif;
              } else {
                statut = statutInactif;
              }
              // Statut connexion
              const connexion = chauffeur.isOnline ? t('dashboard.online') : t('dashboard.offline');
              // Map vehicleType ID to name
              const vehicleTypeName = vehicleTypes.find(vt => vt.id === chauffeur.vehicleType)?.name || '-';
              return (
                <TableRow key={chauffeur.id} className={`${rowHeight}`} style={fontSizeStyle}>
                  <TableCell data-rtl={settings.language === 'ar'} className={`font-medium ${cellPaddingClass}`} style={fontSizeStyle}>
                    <div className="whitespace-nowrap" style={fontSizeStyle}>
                      {chauffeur.employeeType === 'externe' ? t('chauffeurs.tpPrefix') : ''}{chauffeur.firstName} {chauffeur.lastName}
                    </div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <div className="whitespace-nowrap" style={fontSizeStyle}>{chauffeur.username}</div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <span className="tracking-widest text-lg select-none whitespace-nowrap" aria-label={t('forms.passwordMasked') || 'Mot de passe masqué'} style={fontSizeStyle}>••••••••</span>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <div className="space-y-1">
                      {chauffeur.phone.map((p, index) => (
                        <div key={index} className="whitespace-nowrap" style={fontSizeStyle}>{p}</div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <div className="whitespace-nowrap" style={fontSizeStyle}>{vehicleTypeName}</div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <Badge
                      size="md"
                      variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}
                      className={`${badgeClass}`}
                      style={{ ...badgeStyle }}
                    >
                      {chauffeur.employeeType === 'interne' ? t('chauffeurs.employeeTypeShort.interne') : t('chauffeurs.employeeTypeShort.externe')}
                    </Badge>
                  </TableCell>
                  {/* Position column */}
                  {showPosition ? (
                    <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                      {typeof chauffeur.latitude === 'number' && typeof chauffeur.longitude === 'number'
                        ? `${chauffeur.latitude.toFixed(5)}, ${chauffeur.longitude.toFixed(5)}`
                        : '-'}
                    </TableCell>
                  ) : null}
                  {/* GPS column */}
                  <TableCell data-rtl={settings.language === 'ar'} style={fontSizeStyle} className={`${cellPaddingClass}`}>
                    <span
                      className="material-icons"
                      title={chauffeur.gpsActive ? t('chauffeurs.gpsEnabled') : t('chauffeurs.gpsDisabled')}
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
                  <TableCell data-rtl={settings.language === 'ar'} className={`min-w-[70px] whitespace-nowrap ${cellPaddingClass} text-center`} style={fontSizeStyle}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <span
                        title={connexion}
                        style={{
                          display: 'inline-block',
                          width: 16,
                          height: 16,
                          borderRadius: '50%',
                          background: chauffeur.isOnline ? '#22c55e' : '#ef4444',
                          boxShadow: chauffeur.isOnline
                            ? '0 0 8px 2px #22c55e, 0 2px 6px rgba(34,197,94,0.3)'
                            : '0 0 6px 1px #ef4444, 0 2px 6px rgba(239,68,68,0.3)',
                        }}
                      />
                    </div>
                  </TableCell>
                  {/* Statut column */}
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <Badge
                      size="md"
                      className={`${badgeClass}`}
                      style={{ ...badgeStyle }}
                      // Use localized labels for comparisons so AR/EN/FR behave consistently
                      variant={(() => {
                        const activeLabel = t('chauffeurs.active');
                        const enPanneLabel = t('chauffeurs.enPanne');
                        if (statut === activeLabel) return 'default';
                        if (statut === enPanneLabel) return 'destructive';
                        return 'outline';
                      })()}
                    >
                      {statut}
                    </Badge>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`min-w-[90px] ${cellPaddingClass}`} style={fontSizeStyle}>
                    <div className="flex gap-1" style={fontSizeStyle}>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-center rounded-md border border-border`}
                        style={{ width: computedRowPx, height: computedRowPx }}
                        onClick={() => onEditChauffeur(chauffeur)}
                        title={t('forms.edit')}
                      >
                        <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-center rounded-md border border-border text-red-600 hover:text-red-700`}
                        style={{ width: computedRowPx, height: computedRowPx }}
                        onClick={() => onDeleteChauffeur(chauffeur.id)}
                        title={t('forms.delete')}
                      >
                        <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
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
