import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { Declaration } from '../../types';
import CopyButton from '../CopyButton';

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
  fontSize = '100',
  onConsultDeclaration,
  chauffeurTypes
}: DeclarationsTableProps) => {
  const [localFontSize, setLocalFontSize] = useState(fontSize);
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

  const { t } = useTranslation();
  const getStatusBadge = (status: string) => {
    const badgeFontSize = { fontSize: `${Math.round(100 * zoom)}%` };
    switch (status) {
      case 'en_route':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" style={badgeFontSize}>{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" style={badgeFontSize}>{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" style={badgeFontSize}>{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" style={badgeFontSize}>{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" style={badgeFontSize}>{t('dashboard.refused')}</Badge>;
      default:
        return <Badge variant="outline" style={badgeFontSize}>{status}</Badge>;
    }
  };

  // Largeur dynamique, hauteur et taille des objets selon le zoom
  // Facteur de base pour 100%
  const baseColWidth = 160;
  const baseColWidthSmall = 110;
  const baseRowHeight = 32; // hauteur encore plus compacte
  const baseCheckbox = 14; // encore plus petit pour une case compacte
  const baseIcon = 18;
  const baseBadgeFont = 14;
  const baseBadgePx = 12;
  const baseBadgePy = 6;

  // Calcul dynamique selon le zoom
  // Correction : chaque niveau de zoom est strictement croissant
  // Correction du facteur de zoom (100% le plus grand)
  // Système de zoom plus doux et lisible
  // Système de zoom visuel : 80% = ancien 90%, 40% = 0.65, paliers doux
  // Zoom 100% = 1, 90% = 0.95, diminution douce (0.05 ou 0.075)
  // Zoom : 80% = 0.9, 90% = 0.95, 100% = 1.0, autres paliers ajustés
  // Coefficients de zoom améliorés pour la lisibilité
  const zoomLevelsGlobal = {
    '40': 0.75,
    '50': 0.80,
    '60': 0.85,
    '70': 0.90,
    '80': 0.95,
    '90': 1.0,
    '100': 1.05
  };
  const zoomGlobal = zoomLevelsGlobal[String(fontSize)] ?? 1.0;
  const colWidth = `w-[${Math.round(baseColWidth * zoomGlobal)}px]`;
  // Colonne État : largeur adaptée dynamiquement au texte et au zoom
  // Largeur exacte selon le texte affiché et le zoom
  const statusText = ['En Attente', 'Validé', 'Refusé'];
  // On prend la longueur du texte le plus long, sans padding
  const maxStatusLength = Math.max(...statusText.map(t => t.trim().length));
  // Largeur = longueur du texte * taille de police * facteur zoom * 0.6 (plus serré)
  const colWidthEtatPx = Math.round(maxStatusLength * baseBadgeFont * zoomGlobal * 0.6);
  // Colonne État : largeur strictement fixe et compacte, indépendante du zoom
  const colWidthEtat = `w-[60px] min-w-[60px] max-w-[60px]`;
  // Colonne Actions : largeur fixe idéale pour tous les zooms (calculée pour 90%)
  // Colonne Actions : largeur strictement fixe à la limite des boutons, indépendante du zoom
  // 2 boutons fixes (Edit, Delete), 2 en plus si état "en_cours"
  const iconPxFixe = 18; // taille icône
  const paddingPxFixe = 8; // padding autour du bouton
  const nbActionsMax = 4; // maximum d'actions affichées
  const colWidthActionsPx = nbActionsMax * (iconPxFixe + paddingPxFixe);
  const colWidthActions = `w-[${colWidthActionsPx}px] min-w-[${colWidthActionsPx}px] max-w-[${colWidthActionsPx}px]`;
  // Colonne case à cocher : largeur fixe idéale pour tous les zooms (calculée pour 100%)
  // Colonne case à cocher : largeur fixe petite, calculée pour 90%, sans dépendance au zoom
  // Largeur strictement fixe pour la première colonne, indépendante du zoom
  const colWidthCheckbox = `w-[18px] min-w-[18px] max-w-[18px]`;
  const colWidthSmall = `w-[${Math.round(Math.max(baseColWidthSmall * zoomGlobal, 80))}px]`;
  // Correction : la case à cocher à 100% est plus grande que 90%
  const checkboxSize = `h-[${baseCheckbox}px] w-[${baseCheckbox}px]`;
  // Icônes adaptées dynamiquement au zoom
  const iconSize = `h-[${Math.round(baseIcon * zoomGlobal)}px] w-[${Math.round(baseIcon * zoomGlobal)}px]`;
  const badgeSize = `text-[${Math.round(baseBadgeFont * zoomGlobal)}px] px-[${Math.round(baseBadgePx * zoomGlobal)}px] py-[${Math.round(baseBadgePy * zoomGlobal)}px]`;
  const fontSizeStyleGlobal = { fontSize: `${Math.round(100 * zoomGlobal)}%` };
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
          <Table>
            <TableHeader>
              <TableRow className={rowHeight}>
                {setSelectedDeclarationIds && (
                  <TableHead className={`${colWidthCheckbox} text-center`} style={fontSizeStyle}>
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
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>Numéro</TableHead>
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>Chauffeur</TableHead>
                <TableHead className={`${colWidthSmall} whitespace-nowrap`} style={fontSizeStyle}>Distance</TableHead>
                {/* Affiche Frais uniquement pour chauffeur externe */}
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>Frais de Livraison</TableHead>
                {/* Affiche Prime de route pour interne et planificateur */}
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route' : t('declarations.primeDeRoute')}</TableHead>
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>Créé</TableHead>
                <TableHead className={`${colWidth} whitespace-nowrap`} style={fontSizeStyle}>Validé</TableHead>
                <TableHead className={`${colWidthEtat} whitespace-nowrap`} style={fontSizeStyle}>État</TableHead>
                <TableHead className={`${colWidthActions} whitespace-nowrap`} style={fontSizeStyle}>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {declarations.map((declaration) => (
                <TableRow key={declaration.id}>
                  {setSelectedDeclarationIds && (
                    <TableCell className={`text-center`} style={fontSizeStyle}>
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
                  <TableCell className={`font-medium cursor-pointer hover:underline whitespace-nowrap`} style={fontSizeStyle} onClick={() => onConsultDeclaration && onConsultDeclaration(declaration)}>
                    <div className={`truncate whitespace-nowrap`} style={fontSizeStyle}>{declaration.number}</div>
                  </TableCell>
                  <TableCell className={`whitespace-nowrap`} style={fontSizeStyle}>
                    <div className={`truncate whitespace-nowrap`} style={fontSizeStyle}>{declaration.chauffeurName}</div>
                  </TableCell>
                  <TableCell className={`text-center whitespace-nowrap`} style={fontSizeStyle}>
                    {declaration.distance ? (
                      <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                        <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.distance.toFixed(2)}</span>
                        <CopyButton value={Math.floor(declaration.distance).toString()} />
                      </div>
                    ) : '-'}
                  </TableCell>
                  {/* Frais de Livraison : afficher uniquement pour chauffeur externe */}
                  <TableCell className={`text-right whitespace-nowrap`} style={fontSizeStyle}>
                    {chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'externe' && declaration.deliveryFees ? (
                      <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                        <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.deliveryFees.toFixed(2)} DZD</span>
                        <CopyButton value={Math.floor(declaration.deliveryFees).toString()} />
                      </div>
                    ) : '-'}
                  </TableCell>
                  {/* Prime de route : afficher pour interne et planificateur */}
                  <TableCell className={`text-center whitespace-nowrap`} style={fontSizeStyle}>
                    {(chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'interne' && declaration.primeDeRoute) || (!chauffeurTypes && declaration.primeDeRoute) ? (
                      <span>{declaration.primeDeRoute.toFixed(2)} DZD</span>
                    ) : '-'}
                  </TableCell>
                  <TableCell className={`whitespace-nowrap`} style={fontSizeStyle}>
                    <span className={`whitespace-nowrap`} style={fontSizeStyle}>{new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</span>
                  </TableCell>
                  <TableCell className={`whitespace-nowrap`} style={fontSizeStyle}>
                    <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.validatedAt 
                      ? new Date(declaration.validatedAt).toLocaleDateString('fr-FR', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric'
                        })
                      : '-'}</span>
                  </TableCell>
                  <TableCell className={`whitespace-nowrap text-center`} style={fontSizeStyle}>
                    <span style={{ display: 'inline-block' }}>{getStatusBadge(declaration.status)}</span>
                  </TableCell>
                  <TableCell className={`whitespace-nowrap`} style={fontSizeStyle}>
                    <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`p-0 ${iconSize}`}
                        onClick={() => onEditDeclaration(declaration)}
                      >
                        <Edit className={`${iconSize} min-w-0`} />
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className={`p-0 ${iconSize} text-red-600 hover:text-red-700`}
                        onClick={() => onDeleteDeclaration(declaration.id)}
                      >
                        <Trash2 className={`${iconSize} min-w-0`} />
                      </Button>
                      {declaration.status === 'en_cours' && (
                        <>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`p-0 text-green-600 hover:text-green-700 ${iconSize}`}
                              onClick={() => onValidateDeclaration(declaration.id)}
                            >
                              <Check className={`${iconSize} min-w-0`} />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className={`p-0 text-red-600 hover:text-red-700 ${iconSize}`}
                              onClick={() => onRejectDeclaration(declaration.id)}
                            >
                              <X className={`${iconSize} min-w-0`} />
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
