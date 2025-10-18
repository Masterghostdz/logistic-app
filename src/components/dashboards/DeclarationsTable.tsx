import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { Declaration, PaymentReceipt } from '../../types';
import CopyButton from '../CopyButton';
import useTableZoom, { FontSizeKey } from '../../hooks/useTableZoom';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';

interface DeclarationsTableProps {
  declarations: Declaration[];
  onValidateDeclaration: (id: string) => void;
  onRejectDeclaration: (id: string) => void;
  onEditDeclaration?: (declaration: Declaration) => void;
  onDeleteDeclaration?: (id: string) => void;
  selectedDeclarationIds?: string[];
  setSelectedDeclarationIds?: (ids: string[]) => void;
  mobile?: boolean;
  fontSize?: FontSizeKey | '40' | '50';
  onConsultDeclaration?: (declaration: Declaration) => void;
  onSendReceipts?: (declaration: Declaration) => void;
  chauffeurTypes?: Record<string, 'interne' | 'externe'>;
  // When true, render columns in the same order and with the same conditions as the Chauffeur dashboard
  chauffeurView?: boolean;
  // Optional custom renderer for the status badge (allows passing the dashboard's getStatusBadge)
  renderStatusBadge?: (status: string, declaration?: Declaration) => React.ReactNode;
  // optional payments list to compute recouvrement status and totals
  payments?: PaymentReceipt[];
  // hide the recouvrement-specific columns (used by Caissier recouvrement view)
  hideRecouvrementFields?: boolean;
  // hide status column (for external cashier)
  hideStatusColumn?: boolean;
  // hide validated/validatedAt column (for external cashier)
  hideValidatedColumn?: boolean;
  // hide the send (Envoyer) action/button (for external cashier)
  hideSendButton?: boolean;
  // Optional: reference (full) declarations array used to compute which columns/headers must be shown.
  // This ensures header visibility doesn't change when the parent filters the displayed rows.
  referenceDeclarations?: Declaration[];
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
  onSendReceipts,
  chauffeurTypes,
  chauffeurView = false,
  renderStatusBadge,
  payments,
  hideRecouvrementFields = false,
  hideStatusColumn = false,
  hideValidatedColumn = false
  , hideSendButton = false,
  referenceDeclarations = []
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
  const auth = useAuth();
  const isExternalCaissier = !!(auth?.user && auth.user.role === 'caissier' && auth.user.employeeType === 'externe');

  // Column visibility toggles (user can choose which columns to show). Default: all visible
  const [columnsVisible, setColumnsVisible] = useState(() => ({
    chauffeur: true,
    distance: true,
    deliveryFees: true,
    primeDeRoute: true,
    createdDate: true,
    declaredAt: true,
    paymentRecoveredAt: true,
    validated: true,
    payments: true,
    recoveredAmount: true,
    status: true
  }));

  const menuRef = useRef<HTMLDivElement | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [menuOpen]);

  // Helper to delete a declaration: always use parent callback (ChauffeurDashboard shows dialog), never browser confirm.
  const handleDelete = (id: string) => {
    if (onDeleteDeclaration) {
      try {
        onDeleteDeclaration(id);
      } catch (e) {
        console.error('onDeleteDeclaration threw', e);
        toast({ title: t('forms.error') || 'Erreur', description: (e as any)?.message || undefined, variant: 'destructive' });
      }
    }
  };

  const getStatusBadge = (status: string, declaration?: Declaration) => {
    const pad = 'px-[10px]';
    switch (status) {
      case 'en_route':
        return <Badge className={`bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200 ${badgeClass} ${pad}`}>{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
        return <Badge className={`bg-orange-100 text-orange-800 border border-orange-300 dark:bg-orange-900 dark:text-orange-200 ${badgeClass} ${pad}`}>{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
        return <Badge className={`bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 ${badgeClass} ${pad}`}>{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className={`bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200 ${badgeClass} ${pad}`}>{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return <Badge className={`bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 ${badgeClass} ${pad}`}>{t('declarations.refused') || t('dashboard.refused')}</Badge>;
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
  // Determine whether to show the deliveryFees and prime headers based on the
  // data and the provided chauffeurTypes mapping. We show a header only when
  // at least one declaration would display a value for that column.
  // Use the provided referenceDeclarations if available (typically the full list of declarations)
  // so that header visibility remains stable even when the displayed "declarations" array is filtered.
  const refDecls = referenceDeclarations && referenceDeclarations.length > 0 ? referenceDeclarations : declarations;
  // Determine user cashier type
  const isInternalCaissier = !!(auth?.user && auth.user.role === 'caissier' && auth.user.employeeType === 'interne');
  const isCaissier = !!(auth?.user && auth.user.role === 'caissier');
  // Show delivery header when at least one referenced declaration belongs to an external chauffeur
  // OR when any referenced declaration already has a deliveryFees value.
  // Also always show the column for internal caissiers so they can see/manage delivery fees.
  // NOTE: only use the explicit chauffeurTypes mapping as the condition for chauffeur-derived visibility (no 'TP - ' fallback).
  const showDeliveryHeader = isInternalCaissier || refDecls.some(d => {
    if (chauffeurTypes) return chauffeurTypes[d.chauffeurId] === 'externe' || !!d.deliveryFees;
    return !!d.deliveryFees;
  });
  const showPrimeHeader = refDecls.some(d => {
    if (chauffeurTypes) return chauffeurTypes[d.chauffeurId] === 'interne' && d.primeDeRoute;
    return !!d.primeDeRoute;
  });
  // When the current user is a caissier (external OR internal), hide distance/prime/delivery columns.
  // Other roles keep the columns as before.
  const showRecouvrementColsForUser = !(isExternalCaissier || isInternalCaissier);

  // Determine whether to show the status column: only internal caissiers or non-caissier users (respecting hideStatusColumn)
  const showStatusColumn = isInternalCaissier || (!isCaissier && !hideStatusColumn);

  // Compute which columns are relevant in the current context (role, employeeType, props)
  const availableColumns = useMemo(() => {
    const cols: Array<{ key: string; label: string }> = [];
    // Chauffeur column present only when not in chauffeurView
    if (!chauffeurView) cols.push({ key: 'chauffeur', label: t('declarations.chauffeur') || 'Chauffeur' });
    // Distance/delivery/prime only if recouvrement columns are allowed for this user
    if (showRecouvrementColsForUser) {
      cols.push({ key: 'distance', label: t('declarations.distance') || 'Distance' });
      if (showDeliveryHeader) cols.push({ key: 'deliveryFees', label: t('declarations.deliveryFees') || 'Frais de livraison' });
      if (showPrimeHeader) cols.push({ key: 'primeDeRoute', label: t('declarations.primeDeRoute') || 'Prime de route' });
    }
    // createdDate and declaredAt always useful
    cols.push({ key: 'createdDate', label: t('declarations.createdDate') || 'Date création' });
    cols.push({ key: 'declaredAt', label: t('declarations.declaredAt') || 'Date déclaration' });
    // paymentRecoveredAt only relevant for caissiers
    if (isCaissier) cols.push({ key: 'paymentRecoveredAt', label: t('declarations.paymentRecoveredAt') || 'Date recouvrement' });
    // validated column only for non-caissier and when not explicitly hidden
    if (!isCaissier && !hideValidatedColumn) cols.push({ key: 'validated', label: t('declarations.validated') || 'Date Validation' });
    // Recouvrement columns depend on hideRecouvrementFields
    if (!hideRecouvrementFields) {
      cols.push({ key: 'payments', label: t('declarations.payments') || 'Paiements' });
      cols.push({ key: 'recoveredAmount', label: t('declarations.recoveredAmount') || 'Montant recouvré' });
    }
    // status column: visible only to internal caissiers or to non-caissier users (respect hideStatusColumn)
    if (showStatusColumn) cols.push({ key: 'status', label: t('declarations.status') || 'Statut' });
    return cols;
  }, [chauffeurView, showRecouvrementColsForUser, showDeliveryHeader, showPrimeHeader, isCaissier, isInternalCaissier, hideValidatedColumn, hideRecouvrementFields, hideStatusColumn, showStatusColumn, t]);

  // Helper function to toggle all columns based on the availableColumns context
  const toggleAllColumns = (enable: boolean) => {
    setColumnsVisible(Object.fromEntries(availableColumns.map(c => [c.key, enable])) as any);
  };

  // Desktop-only resizable columns state
  const [columnWidths, setColumnWidths] = useState<Record<string, number>>({});

  // sensible default widths (px) per column key
  const defaultColumnWidths: Record<string, number> = {
    number: 120,
    chauffeur: 160,
    distance: 90,
    deliveryFees: 120,
    primeDeRoute: 120,
    createdDate: 120,
    declaredAt: 140,
    paymentRecoveredAt: 150,
    validated: 130,
    payments: 120,
    recoveredAmount: 130,
    status: 90,
    actions: Math.max(90, Math.round(4 * 24 * zoomGlobal))
  };

  // Initialize column widths when availableColumns change (desktop only)
  useEffect(() => {
    if (mobile) return; // only enable resizing on desktop
    setColumnWidths(prev => {
      const next = { ...prev } as Record<string, number>;
      availableColumns.forEach(c => {
        if (!next[c.key]) next[c.key] = defaultColumnWidths[c.key] || 120;
      });
      return next;
    });
  }, [availableColumns, mobile]);

  // Resizable TableHead wrapper used to add a draggable resizer to each header cell
  const ResizableTableHead: React.FC<{ colKey: string; className?: string; style?: React.CSSProperties; children?: React.ReactNode }>
    = ({ colKey, className, style, children }) => {
    const startX = useRef<number | null>(null);
    const startWidth = useRef<number>(0);

    const handleMouseDown = (e: React.MouseEvent) => {
      // only left button
      if ((e as any).button && (e as any).button !== 0) return;
      e.preventDefault();
      startX.current = (e as any).clientX;
      startWidth.current = columnWidths[colKey] || defaultColumnWidths[colKey] || 120;

      const onMouseMove = (ev: MouseEvent) => {
        if (startX.current == null) return;
        const delta = ev.clientX - startX.current;
        const newW = Math.max(40, Math.round(startWidth.current + delta));
        setColumnWidths(prev => ({ ...prev, [colKey]: newW }));
      };

      const onMouseUp = () => {
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
        startX.current = null;
      };

      document.addEventListener('mousemove', onMouseMove);
      document.addEventListener('mouseup', onMouseUp);
    };

    const widthStyle = columnWidths[colKey] ? { width: `${columnWidths[colKey]}px` } : {};

    return (
      <TableHead data-rtl={settings.language === 'ar'} className={className} style={{ ...style, ...widthStyle, position: 'relative' }}>
        {children}
        {!mobile && (
          <div
            role="separator"
            aria-orientation="vertical"
            style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 18, display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 20 }}
          >
            {/* Visible semi-transparent grip icon to indicate resize handle (click & drag) */}
            <div
              onMouseDown={handleMouseDown}
              title={t('table.resize') || 'Redimensionner'}
              style={{ cursor: 'col-resize', padding: 2, borderRadius: 2, opacity: 0.55, transition: 'opacity 120ms', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6B7280' }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.95')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '0.55')}
            >
              {/* Two vertical bars grip icon (more ERP-like) */}
              <svg width="10" height="18" viewBox="0 0 10 18" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
                <rect x="1" y="3" width="2" height="12" rx="1" fill="currentColor" />
                <rect x="7" y="3" width="2" height="12" rx="1" fill="currentColor" />
              </svg>
            </div>
          </div>
        )}
      </TableHead>
    );
  };

  return (
    <>
      {/* Sélecteur de zoom */}
      <div className="flex items-center justify-end mb-2" style={{ position: 'relative' }}>
        <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
        <select
          value={localFontSize}
          onChange={e => setLocalFontSize(e.target.value as FontSizeKey)}
          className="border rounded px-2 py-1 text-xs bg-background"
          title="Zoom sur la taille d'écriture du tableau"
        >
          <option value="100">100%</option>
          <option value="90">90%</option>
          <option value="80">80%</option>
          <option value="70">70%</option>
          <option value="60">60%</option>
        </select>

        {/* 3-dots vertical menu to toggle visible columns */}
        <div ref={menuRef} className="ml-2 relative">
          <button
            aria-label="Colonnes"
            title="Colonnes"
            onClick={() => setMenuOpen(v => !v)}
            className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            {/* vertical three dots */}
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>

          {menuOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-700 rounded shadow z-50 p-2 text-sm">
              <div className="mb-1 font-medium">Colonnes</div>
              <div className="max-h-56 overflow-auto">
                {(
                  availableColumns
                ).map(col => (
                   <label key={col.key} className="flex items-center gap-2 py-1">
                     <input
                       type="checkbox"
                       checked={(columnsVisible as any)[col.key] === true}
                       onChange={() => setColumnsVisible(prev => ({ ...(prev as any), [col.key]: !(prev as any)[col.key] }))}
                       disabled={!availableColumns.find(c => c.key === col.key)}
                     />
                     <span>{col.label}</span>
                   </label>
                 ))}
              </div>
              <div className="flex justify-between mt-2">
                <button onClick={() => toggleAllColumns(true)} className="text-xs text-blue-600">Tout cocher</button>
                <button onClick={() => toggleAllColumns(false)} className="text-xs text-rose-600">Tout décocher</button>
              </div>
            </div>
          )}
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <Table data-rtl={settings.language === 'ar'}>
            <TableHeader data-rtl={settings.language === 'ar'}>
              <TableRow className={rowHeight}>
                  {setSelectedDeclarationIds && (
                    <ResizableTableHead colKey="__select__" className={`${colWidthCheckbox} text-center ${cellPaddingClass}`} style={fontSizeStyle}>
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
                    </ResizableTableHead>
                  )}

                  <ResizableTableHead colKey="number" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.number')}</ResizableTableHead>

                  {!chauffeurView && (
                    <ResizableTableHead colKey="chauffeur" className={`${getMinWidthForChars(16)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{(columnsVisible.chauffeur) ? (t('declarations.chauffeur') || 'Chauffeur') : null}</ResizableTableHead>
                  )}

                  {showRecouvrementColsForUser && columnsVisible.distance && (
                    <ResizableTableHead colKey="distance" className={`${getMinWidthForChars(8)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.distance')}</ResizableTableHead>
                  )}

                  {showDeliveryHeader && showRecouvrementColsForUser && columnsVisible.deliveryFees ? (
                    <ResizableTableHead colKey="deliveryFees" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.deliveryFees')}</ResizableTableHead>
                  ) : null}

                  {showPrimeHeader && showRecouvrementColsForUser && columnsVisible.primeDeRoute ? (
                    <ResizableTableHead colKey="primeDeRoute" className={`${colWidth} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.primeDeRoute') === 'declarations.primeDeRoute' ? 'Prime de route' : t('declarations.primeDeRoute')}</ResizableTableHead>
                  ) : null}

                  {chauffeurView ? (
                    // chauffeur dashboard order: status then created date
                    <>
                      {showStatusColumn && columnsVisible.status && (
                         <ResizableTableHead colKey="status" className={`${colWidthEtat} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.status')}</ResizableTableHead>
                       )}
                       <ResizableTableHead colKey="createdDate" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.createdDate')}</ResizableTableHead>
                      {/* Date de déclaration */}
                      <ResizableTableHead colKey="declaredAt" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.declaredAt') || 'Date de déclaration'}</ResizableTableHead>
                    </>
                  ) : (
                    <>
                      <ResizableTableHead colKey="createdDate" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.createdDate')}</ResizableTableHead>
                      {/* Date de déclaration */}
                      <ResizableTableHead colKey="declaredAt" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.declaredAt') || 'Date de déclaration'}</ResizableTableHead>
                      {/* Date de recouvrement: visible aux caissiers (interne et externe) - moved immediately après Date de déclaration */}
                      {!chauffeurView && isCaissier && columnsVisible.paymentRecoveredAt && (
                        <ResizableTableHead colKey="paymentRecoveredAt" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                          {t('declarations.paymentRecoveredAt') || 'Date recouvrement'}
                        </ResizableTableHead>
                      )}
                      {!hideValidatedColumn && !isCaissier && columnsVisible.validated && (
                        <ResizableTableHead colKey="validated" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.validated') || t('declarations.validated')}</ResizableTableHead>
                      )}
                      {!hideRecouvrementFields && columnsVisible.payments && (
                        <ResizableTableHead colKey="payments" className={`${colWidthSmall} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.payments') || 'Paiements'}</ResizableTableHead>
                      )}
                      {!hideRecouvrementFields && columnsVisible.recoveredAmount && (
                        <ResizableTableHead colKey="recoveredAmount" className={`${colWidthSmall} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.recoveredAmount') || 'Montant Recouvré'}</ResizableTableHead>
                      )}
                      {showStatusColumn && columnsVisible.status && (
                        <ResizableTableHead colKey="status" className={`${colWidthEtat} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.status')}</ResizableTableHead>
                      )}
                    </>
                  )}
                  <ResizableTableHead colKey="actions" className={`${getMinWidthForChars(12)} whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>{t('declarations.actions')}</ResizableTableHead>
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
                  {!chauffeurView && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${getMinWidthForChars(12)} ${cellPaddingClass}`} style={fontSizeStyle}>
                      <div className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.chauffeurName}</div>
                    </TableCell>
                  )}
                  {/* programReference cell hidden */}
                  {showRecouvrementColsForUser && columnsVisible.distance && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`text-center whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                      {declaration.distance ? (
                        <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                          <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.distance.toFixed(2)}</span>
                          <CopyButton value={Math.floor(declaration.distance).toString()} />
                        </div>
                      ) : '-'}
                    </TableCell>
                  )}
                  {/* Frais de Livraison and Prime de route: hide for external cashier via showRecouvrementColsForUser */}
                  {showRecouvrementColsForUser && showDeliveryHeader && columnsVisible.deliveryFees ? (
                    <TableCell data-rtl={settings.language === 'ar'} className={`text-right whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                      {chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'externe' && declaration.deliveryFees ? (
                        <div className={`flex items-center gap-1 whitespace-nowrap`} style={fontSizeStyle}>
                          <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.deliveryFees.toFixed(2)} DZD</span>
                          <CopyButton value={Math.floor(declaration.deliveryFees).toString()} />
                        </div>
                      ) : '-'}
                    </TableCell>
                  ) : null}
                  {showRecouvrementColsForUser && showPrimeHeader && columnsVisible.primeDeRoute ? (
                    <TableCell data-rtl={settings.language === 'ar'} className={`text-center whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                      {(chauffeurTypes && chauffeurTypes[declaration.chauffeurId] === 'interne' && declaration.primeDeRoute) || (!chauffeurTypes && declaration.primeDeRoute) ? (
                        <span className={`${getMinWidthForChars(6)} inline-block font-bold`} style={{ ...fontSizeStyle, color: '#D4AF37' /* gold-ish */ }}>{declaration.primeDeRoute.toFixed(2)} DZD</span>
                      ) : '-' }
                    </TableCell>
                  ) : null}
                  {/* If in chauffeurView, render status here (header places status before createdDate) */}
                  {chauffeurView && showStatusColumn && columnsVisible.status && (
                     <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                       {renderStatusBadge ? renderStatusBadge(declaration.status, declaration) : getStatusBadge(declaration.status, declaration)}
                     </TableCell>
                   )}
                  <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <span className={`whitespace-nowrap`} style={fontSizeStyle}>{new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric'
                    })}</span>
                  </TableCell>
                  {/* Date de déclaration (champ declaredAt si présent, sinon '-') */}
                  {columnsVisible.declaredAt && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                      <span className={`whitespace-nowrap`} style={fontSizeStyle}>{((declaration as any).declaredAt) ? new Date((declaration as any).declaredAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}</span>
                    </TableCell>
                  )}
                  {/* Date de recouvrement: visible aux caissiers (interne et externe) - moved here immédiatement après Date de déclaration */}
                  {!chauffeurView && isCaissier && columnsVisible.paymentRecoveredAt && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                      {((declaration as any).paymentRecoveredAt) ? new Date((declaration as any).paymentRecoveredAt).toLocaleDateString('fr-FR', {
                        day: '2-digit', month: '2-digit', year: 'numeric'
                      }) : '-'}
                    </TableCell>
                  )}
                  {!hideValidatedColumn && !isCaissier && columnsVisible.validated && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                      <span className={`whitespace-nowrap`} style={fontSizeStyle}>{declaration.validatedAt 
                        ? new Date(declaration.validatedAt).toLocaleDateString('fr-FR', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })
                        : '-'}</span>
                    </TableCell>
                  )}
                  {/* Recouvrement columns */}
                  {!hideRecouvrementFields && (columnsVisible.payments || columnsVisible.recoveredAmount) && (() => {
                    // determine payments related to this declaration
                    const related = (payments || (declaration as any).paymentReceipts || []).filter((p: PaymentReceipt) => String(p.declarationId || '') === String(declaration.id));
                    const validated = related.filter(p => ['validee', 'validated', 'valide', 'valid'].includes(String(p.status || '').toLowerCase()));
                    const recoveredPayments = related.filter(p => ['validee', 'validated', 'valide', 'valid', 'recu'].includes(String(p.status || '').toLowerCase()));
                    const totalRecovered = recoveredPayments.reduce((s, p) => s + (Number(p.montant || 0)), 0);
                    // The declaration is considered 'Recouvré' only when the declaration itself
                    // has been marked by the caissier (we set this via updateDeclaration on Envoyer).
                    const declPaymentState = String((declaration as any).paymentState || '').toLowerCase();
                    // Use "recouvr" here to match other places (recouvré / recouvr)
                    const isRecouvre = declPaymentState.startsWith('recouvr');
                    return (
                      <>
                            {columnsVisible.payments && (
                              <TableCell data-rtl={settings.language === 'ar'} className={`text-center whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                                {isRecouvre ? (
                                  <Badge className={`bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200 ${badgeClass} px-[10px]`}>
                                    {t('declarations.recovered') || 'Recouvré'}
                                  </Badge>
                                ) : (
                                  <Badge className={`bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-800 dark:text-gray-200 ${badgeClass} px-[10px]`}>
                                    {t('declarations.notRecovered') || 'Non Recouvré'}
                                  </Badge>
                                )}
                              </TableCell>
                            )}
                        {columnsVisible.recoveredAmount && (
                          <TableCell data-rtl={settings.language === 'ar'} className={`text-right whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                            {isRecouvre ? <span className="inline-block">{totalRecovered.toFixed(2)} DZD</span> : '-' }
                          </TableCell>
                        )}
                      </>
                    );
                  })()}
                  {!chauffeurView && showStatusColumn && columnsVisible.status && (
                    <TableCell data-rtl={settings.language === 'ar'} className={`whitespace-nowrap text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                      {renderStatusBadge ? renderStatusBadge(declaration.status, declaration) : getStatusBadge(declaration.status, declaration)}
                    </TableCell>
                  )}
                  <TableCell className={`whitespace-nowrap ${cellPaddingClass}`} style={fontSizeStyle}>
                    <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                      {/* For chauffeur view: allow edit+delete only when status is 'en_cours', delete-only when 'en_route'.
                          For non-chauffeur views keep previous behaviour (edit+delete for en_cours/en_route if callbacks provided). */}
                      {chauffeurView ? (
                        (declaration.status === 'en_cours' || declaration.status === 'en_route') && (
                          <>
                            {declaration.status === 'en_cours' && onEditDeclaration && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`flex items-center justify-center rounded-md`}
                                style={{ width: computedRowPx, height: computedRowPx }}
                                onClick={() => onEditDeclaration(declaration)}
                              >
                                <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                              </Button>
                            )}
                            {onDeleteDeclaration && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`flex items-center justify-center rounded-md text-red-600 hover:text-red-700`}
                                style={{ width: computedRowPx, height: computedRowPx }}
                                onClick={() => handleDelete(declaration.id)}
                              >
                                <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                              </Button>
                            )}
                          </>
                        )
                      ) : (
                        (onEditDeclaration || onDeleteDeclaration) && (declaration.status === 'en_cours' || declaration.status === 'en_route') && (
                          <>
                            {onEditDeclaration && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`flex items-center justify-center rounded-md`}
                                style={{ width: computedRowPx, height: computedRowPx }}
                                onClick={() => onEditDeclaration(declaration)}
                              >
                                <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                              </Button>
                            )}
                            {onDeleteDeclaration && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`flex items-center justify-center rounded-md text-red-600 hover:text-red-700`}
                                style={{ width: computedRowPx, height: computedRowPx }}
                                onClick={() => handleDelete(declaration.id)}
                              >
                                <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                              </Button>
                            )}
                          </>
                        )
                      )}
                       {onSendReceipts && !hideSendButton && (
                        (() => {
                          const declPaymentState = String((declaration as any).paymentState || '').toLowerCase();
                          const isRecouvre = declPaymentState.startsWith('recouvr');
                          if (isRecouvre) {
                            // show Annuler button (undo) to revert recouvrement
                            return (
                              <div className="flex gap-1">
                                {/* Annuler (undo) should be available only to internal caissiers */}
                                {!isExternalCaissier && (
                                  <Button
                                    key="cancel-recouv"
                                    title={t('payments.undo') || 'Annuler'}
                                    size="sm"
                                    variant="ghost"
                                    className={`flex items-center justify-center rounded-md text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900`}
                                    style={{ width: computedRowPx, height: computedRowPx }}
                                    onClick={async () => {
                                      try {
                                        const { updateDeclaration } = await import('../../services/declarationService');
                                        const traceEntry = { userId: null, userName: null, action: t('traceability.revokedRecouvrement') || 'Annulation recouvrement', date: new Date().toISOString() };
                                        await updateDeclaration(declaration.id, { paymentState: '', paymentRecoveredAt: null }, traceEntry);
                                      } catch (e) {
                                        console.error('Cancel recouvrement failed', e);
                                        toast({
                                          title: t('forms.error') || 'Erreur',
                                          description: (e as any)?.message || undefined,
                                          variant: 'destructive'
                                        });
                                      }
                                    }}
                                  >
                                    {/* Undo icon */}
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: computedIconPx, height: computedIconPx }}>
                                      <path d="M21 12a9 9 0 10-9 9" />
                                      <path d="M21 3v9h-9" />
                                    </svg>
                                  </Button>
                                )}

                                {/* Recevoir: open send receipts dialog when declaration is recouvré */}
                                {onSendReceipts && isExternalCaissier && (
                                  <Button
                                    key="receive-recouv"
                                    title={t('payments.receive') || 'Recevoir'}
                                    size="sm"
                                    variant="ghost"
                                    className={`flex items-center justify-center rounded-md`}
                                    style={{ width: computedRowPx, height: computedRowPx }}
                                    onClick={() => {
                                      try {
                                        onSendReceipts(declaration);
                                      } catch (e) {
                                        console.error('Open send receipts failed', e);
                                        toast({ title: t('forms.error') || 'Erreur', description: (e as any)?.message || undefined, variant: 'destructive' });
                                      }
                                    }}
                                  >
                                    {/* Eye icon for view/received, color changes if all payments are "recu" */}
                                    {(() => {
                                      const related = (payments || (declaration as any).paymentReceipts || []).filter((p: PaymentReceipt) => String(p.declarationId || '') === String(declaration.id));
                                      const allRecu = related.length > 0 && related.every(p => String(p.status || '').toLowerCase() === 'recu');
                                      const iconColor = allRecu ? '#6B7280' : '#2563EB'; // gray-500 or blue-600
                                      return (
                                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke={iconColor} style={{ width: computedIconPx, height: computedIconPx }}>
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                      );
                                    })()}
                                  </Button>
                                )}
                              </div>
                            );
                          } else {
                            // Only internal cashiers can initiate the 'Envoyer' (send) action
                            return !isExternalCaissier ? (
                              <Button
                                size="sm"
                                variant="ghost"
                                className={`text-green-600 hover:text-green-700 flex items-center justify-center`}
                                style={{ width: computedRowPx, height: computedRowPx }}
                                onClick={() => onSendReceipts && onSendReceipts(declaration)}
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                                  <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2 .01 5z" />
                                </svg>
                              </Button>
                            ) : null;
                          }
                        })()
                      )}
                      {/* Validation actions: only visible to non-chauffeur roles */}
                      {!chauffeurView && declaration.status === 'en_cours' && (
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
