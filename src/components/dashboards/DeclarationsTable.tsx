import React from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { Declaration } from '../../types';
import CopyButton from '../CopyButton';
import useTableZoom from '../../hooks/useTableZoom';

interface DeclarationsTableProps {
  declarations: Declaration[];
  onValidateDeclaration: (id: string) => void;
  onRejectDeclaration: (id: string) => void;
  onEditDeclaration: (declaration: Declaration) => void;
  onDeleteDeclaration: (id: string) => void;
  selectedDeclarationIds?: string[];
  setSelectedDeclarationIds?: (ids: string[]) => void;
  mobile?: boolean;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
  onConsultDeclaration?: (declaration: Declaration) => void;
  chauffeurTypes?: Record<string, 'interne' | 'externe'>;
}

const DeclarationsTable = ({ 
  declarations, 
  onValidateDeclaration, 
  onRejectDeclaration, 
  onEditDeclaration, 
  onDeleteDeclaration,
  selectedDeclarationIds = [],
  setSelectedDeclarationIds,
  mobile = false,
  fontSize = '80',
  onConsultDeclaration,
  chauffeurTypes
}: DeclarationsTableProps) => {
  const {
    localFontSize,
    setLocalFontSize,
    fontSizeStyle,
    rowHeight,
    iconSize,
    cellPaddingClass,
    badgeClass,
    getMinWidthForChars,
    zoomGlobal,
    computedRowPx,
    computedIconPx
  } = useTableZoom(fontSize as any);

  const { t, settings } = useTranslation();
  const getStatusBadge = (status: string) => {
    const pad = 'px-[10px]';
    switch (status) {
      case 'en_route':
        return <Badge className={`bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 ${badgeClass} ${pad}`}>{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
        return <Badge className={`bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 ${badgeClass} ${pad}`}>{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
        return <Badge className={`bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 ${badgeClass} ${pad}`}>{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className={`bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 ${badgeClass} ${pad}`}>{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return <Badge className={`bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 ${badgeClass} ${pad}`}>{t('dashboard.refused')}</Badge>;
      default:
        return <Badge variant="outline" className={`${badgeClass} ${pad}`}>{status}</Badge>;
    }
  };

  // Use helpers from useTableZoom
  const colWidth = `w-[160px] ${getMinWidthForChars(8)}`;
  const colWidthSmall = `w-[110px] ${getMinWidthForChars(6)}`;
  const colWidthEtat = `${getMinWidthForChars(6)} w-[70px]`;
  const colWidthActions = `${getMinWidthForChars(8)} w-[${Math.max(72, Math.round(4 * 24 * zoomGlobal))}px]`;
  const colWidthCheckbox = `w-[18px] min-w-[18px] max-w-[18px]`;
  const checkboxSize = `h-[14px] w-[14px]`;
  return (
    <>
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
      <Card>
        <CardContent className="p-0">
          <Table data-rtl={settings.language === 'ar'}>
            <TableHeader data-rtl={settings.language === 'ar'}>
              <TableRow className={rowHeight}>
                {setSelectedDeclarationIds && (
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthCheckbox} text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                    <input
                      type="checkbox"
                      className={checkboxSize}
                      checked={declarations.length > 0 && selectedDeclarationIds.length === declarations.length}
                      onChange={e => {
                        if (e.target.checked) {
                          setSelectedDeclarationIds(declarations.map(d => d.id));
                        } else {
                          setSelectedDeclarationIds([]);
                        }
                      }}
                    />
                  </TableHead>
                )}
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.number')}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(16)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.chauffeur') || 'Chauffeur'}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(8)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.distance')}</TableHead>
                {/* Affiche Frais uniquement pour chauffeur externe */}
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.deliveryFees')}</TableHead>
                {/* Affiche Prime de route pour interne et planificateur */}
                <TableHead data-rtl={settings.language === 'ar'} className={`${colWidth} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route' : t('declarations.primeDeRoute')}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.createdDate')}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.validated') || t('declarations.validated') /* fallback handled by translations */}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthEtat} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.status')}</TableHead>
                <TableHead data-rtl={settings.language === 'ar'} className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.actions')}</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody data-rtl={settings.language === 'ar'}>
              {declarations.map((declaration) => (
                <TableRow key={declaration.id} className={rowHeight}>
                  {setSelectedDeclarationIds && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                      <input
                        type="checkbox"
                        className={checkboxSize}
                        checked={selectedDeclarationIds.includes(declaration.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedDeclarationIds([...selectedDeclarationIds, declaration.id]);
                          } else {
                            setSelectedDeclarationIds(selectedDeclarationIds.filter(id => id !== declaration.id));
                          }
                        }}
                      />
                    </TableCell>
                  )}
                  <TableCell data-rtl={settings.language === 'ar'} className={`font-medium cursor-pointer hover:underline whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle} onClick={() => onConsultDeclaration && onConsultDeclaration(declaration)}>
                    <div className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.number}</div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${getMinWidthForChars(12)} ${cellPaddingClass}`} style={fontSizeStyle}>
                    <div className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.chauffeurName}</div>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`text-center whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    {declaration.distance ? (
                      <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                        <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.distance.toFixed(2)}</span>
                        <CopyButton value={Math.floor(declaration.distance).toString()} />
                      </div>
                    ) : '-'}
                  </TableCell>
                  {/* Frais de Livraison : afficher uniquement pour chauffeur externe */}
                  <TableCell data-rtl={settings.language === 'ar'} className={`text-right whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    {chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'externe' && declaration.deliveryFees ? (
                      <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                        <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.deliveryFees.toFixed(2)} DZD</span>
                        <CopyButton value={Math.floor(declaration.deliveryFees).toString()} />
                      </div>
                    ) : '-'}
                  </TableCell>
                  {/* Prime de route : afficher pour interne et planificateur */}
                  <TableCell data-rtl={settings.language === 'ar'} className={`text-center whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    {(chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'interne' && declaration.primeDeRoute) || (!chauffeurTypes && declaration.primeDeRoute) ? (
                      <span className={`${getMinWidthForChars(6)} inline-block`} style={fontSizeStyle}>{declaration.primeDeRoute.toFixed(2)} DZD</span>
                    ) : '-' }
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <span className={`whitespace-nowrap`} style={fontSizeStyle}>{new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</span>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.validatedAt 
                      ? new Date(declaration.validatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : '-'}</span>
                  </TableCell>
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                    {getStatusBadge(declaration.status)}
                  </TableCell>
                  <TableCell className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-center rounded-md border border-border`}
                        style={{ width: computedRowPx, height: computedRowPx }}
                        onClick={() => onEditDeclaration(declaration)}
                      >
                        <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-center rounded-md border border-border text-red-600 hover:text-red-700`}
                        style={{ width: computedRowPx, height: computedRowPx }}
                        onClick={() => onDeleteDeclaration(declaration.id)}
                      >
                        <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                      {declaration.status === 'en_cours' && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`flex items-center justify-center rounded-md border border-border text-green-600 hover:text-green-700`}
                            style={{ width: computedRowPx, height: computedRowPx }}
                            onClick={() => onValidateDeclaration(declaration.id)}
                          >
                            <Check style={{ width: computedIconPx, height: computedIconPx }} />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className={`flex items-center justify-center rounded-md border border-border text-red-600 hover:text-red-700`}
                            style={{ width: computedRowPx, height: computedRowPx }}
                            onClick={() => onRejectDeclaration(declaration.id)}
                          >
                            <X style={{ width: computedIconPx, height: computedIconPx }} />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </>
  );
};

export default DeclarationsTable;
