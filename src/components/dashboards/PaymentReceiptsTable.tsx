import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, Check } from 'lucide-react';
import useTableZoom from '../../hooks/useTableZoom';
import { PaymentReceipt } from '../../types';
import SearchAndFilter from '../SearchAndFilter';

interface PaymentReceiptsTableProps {
  receipts: PaymentReceipt[];
  onDeleteReceipt?: (id: string) => void;
  onConsultReceipt?: (receipt: PaymentReceipt) => void;
  onEditReceipt?: (receipt: PaymentReceipt) => void;
  onValidateReceipt?: (receipt: PaymentReceipt) => void;
  // Optional selection support to mirror DeclarationsTable
  selectedReceiptIds?: string[];
  setSelectedReceiptIds?: (ids: string[]) => void;
  mobile?: boolean;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const PaymentReceiptsTable: React.FC<PaymentReceiptsTableProps> = ({
  receipts,
  onDeleteReceipt,
  onConsultReceipt,
  onEditReceipt,
  onValidateReceipt,
  selectedReceiptIds = [],
  setSelectedReceiptIds,
  fontSize = '80'
}) => {
  const { t, settings } = useTranslation();

  const {
    localFontSize,
    setLocalFontSize,
    fontSizeStyle,
    rowHeight,
    iconSize,
    cellPaddingClass,
    badgeClass,
    badgeStyle,
    getMinWidthForChars,
    zoomGlobal,
    computedRowPx,
    computedIconPx,
    computedFontPx
  } = useTableZoom(fontSize as any);

  const [search, setSearch] = useState('');
  const [searchColumn, setSearchColumn] = useState<'all' | 'programReference' | 'companyName' | 'id'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'brouillon' | 'validee'>('all');

  // Column width helpers (aligned with DeclarationsTable)
  const colWidthPhoto = `${getMinWidthForChars(6)} min-w-[56px]`;
  const colWidthRef = `${getMinWidthForChars(12)}`;
  // Use same min chars as DeclarationsTable (slightly smaller) to avoid extra right gap
  const colWidthCompany = `${getMinWidthForChars(14)}`;
  const colWidthDate = `${getMinWidthForChars(12)}`;
  const colWidthMontant = `${getMinWidthForChars(8)} w-[100px]`;
  const colWidthStatus = `${getMinWidthForChars(6)} w-[70px]`;
  const colWidthActions = `${getMinWidthForChars(8)} w-[${Math.max(72, Math.round(4 * 24 * zoomGlobal))}px]`;
  const colWidthCheckbox = `w-[18px] min-w-[18px] max-w-[18px]`;
  const checkboxSize = `h-[14px] w-[14px]`;

  const getStatusBadge = (status: string) => {
    const s = (status || '').toLowerCase();
    // accept several possible stored strings and normalize to translation keys
    if (['brouillon', 'pending', 'pending_validation', 'pending_validation'].includes(s)) {
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-yellow-100 text-yellow-800 ${badgeClass}`}>{t('dashboard.pending') || 'Brouillon'}</Badge>;
    }
    if (['validee', 'validated', 'valid'].includes(s)) {
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-green-100 text-green-800 ${badgeClass}`}>{t('dashboard.validated') || 'Validée'}</Badge>;
    }
    if (['refuse', 'refused', 'rejected'].includes(s)) {
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-red-100 text-red-800 ${badgeClass}`}>{t('declarations.refused') || 'Refusé'}</Badge>;
    }
    return <Badge size="md" variant="outline" style={{ ...badgeStyle }} className={badgeClass}>{status}</Badge>;
  };

  // Filtrage local (recherche + statut)
  const filteredReceipts = receipts.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    if (searchColumn === 'all') {
      return (
        (r.programReference && r.programReference.toLowerCase().includes(s)) ||
        (r.companyName && r.companyName.toLowerCase().includes(s)) ||
        (r.id && r.id.toLowerCase().includes(s))
      );
    }
    if (searchColumn === 'programReference') return !!(r.programReference && r.programReference.toLowerCase().includes(s));
    if (searchColumn === 'companyName') return !!(r.companyName && r.companyName.toLowerCase().includes(s));
    if (searchColumn === 'id') return !!(r.id && r.id.toLowerCase().includes(s));
    return true;
  });

  return (
    <div className="w-full px-0">
      {/* Barre recherche / filtre (hors Card) */}
      <div className="mb-3">
        <SearchAndFilter
          searchValue={search}
          onSearchChange={setSearch}
          filterValue={statusFilter}
          onFilterChange={(v) => setStatusFilter(v as any)}
          filterOptions={[{ value: 'brouillon', label: t('dashboard.pending') || 'Brouillon' }, { value: 'validee', label: t('dashboard.validated') || 'Validé' }]}
          searchColumn={searchColumn}
          onSearchColumnChange={(v) => setSearchColumn(v as any)}
          searchColumnOptions={[
            { value: 'all', label: 'Tous' },
            { value: 'programReference', label: t('declarations.programNumber') || 'Référence' },
            { value: 'companyName', label: t('companies.name') || 'Société' },
            { value: 'id', label: 'ID' }
          ]}
          searchPlaceholder={t('declarations.searchPlaceholder') || 'Rechercher...'}
          filterPlaceholder={t('declarations.filterPlaceholder') || 'Filtrer...'}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <Card className="w-full min-w-full rounded-lg border border-border bg-card shadow-sm">
          <CardContent className="p-0">
            {/* Header inside the framed card: zoom selector on the right */}
            <div className="flex items-center justify-end p-3 border-b border-border">
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
            <Table data-rtl={settings.language === 'ar'}>
              <TableHeader data-rtl={settings.language === 'ar'}>
                <TableRow className={rowHeight}>
                  {setSelectedReceiptIds && (
                    <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthCheckbox} text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                      <input
                        type="checkbox"
                        className={checkboxSize}
                        checked={receipts.length > 0 && selectedReceiptIds.length === receipts.length}
                        onChange={e => {
                          if (e.target.checked) {
                            setSelectedReceiptIds(receipts.map(r => r.id));
                          } else {
                            setSelectedReceiptIds([]);
                          }
                        }}
                      />
                    </TableHead>
                  )}

                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthPhoto} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('forms.photo') || 'Photo'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthRef} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.programNumber') || 'Référence'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthCompany} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('companies.name') || 'Société'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthMontant} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('financial.amount') || t('forms.amount') || 'Montant'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthDate} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.createdDate') || 'Date de création'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthStatus} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.status') || 'État'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthActions} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody data-rtl={settings.language === 'ar'}>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={setSelectedReceiptIds ? 8 : 7} className={`text-center text-muted-foreground text-sm py-8 ${cellPaddingClass}`}>{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map(receipt => (
                    <TableRow key={receipt.id} className={rowHeight}>
                      {setSelectedReceiptIds && (
                        <TableCell data-rtl={settings.language === 'ar'} className={`text-center ${cellPaddingClass}`} style={fontSizeStyle}>
                          <input
                            type="checkbox"
                            className={checkboxSize}
                            checked={selectedReceiptIds.includes(receipt.id)}
                            onChange={e => {
                              if (e.target.checked) {
                                setSelectedReceiptIds([...selectedReceiptIds, receipt.id]);
                              } else {
                                setSelectedReceiptIds(selectedReceiptIds.filter(id => id !== receipt.id));
                              }
                            }}
                          />
                        </TableCell>
                      )}

                      <TableCell className={`${colWidthPhoto} ${cellPaddingClass}`} style={fontSizeStyle}>
                        {/* Framed photo: border + fixed size scaled with zoom for consistent look */}
                        <div className="border rounded overflow-hidden">
                          <button type="button" onClick={() => onConsultReceipt && onConsultReceipt(receipt)} className="block p-0 m-0">
                            <img
                              src={receipt.photoUrl}
                              alt="reçu"
                              className="object-cover block"
                              style={{
                                width: `${Math.max(48, Math.round(64 * zoomGlobal))}px`,
                                height: `${Math.max(32, Math.round((computedRowPx || 44) - 8))}px`,
                                display: 'block'
                              }}
                            />
                          </button>
                        </div>
                      </TableCell>

                      <TableCell className={`${colWidthRef} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle} onClick={() => onConsultReceipt && onConsultReceipt(receipt)}>
                        <div className={`cursor-pointer font-medium whitespace-nowrap truncate`} style={fontSizeStyle}>{receipt.programReference}</div>
                      </TableCell>

                      <TableCell className={`${colWidthCompany} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className={`whitespace-nowrap truncate`} style={fontSizeStyle}>{receipt.companyName}</div>
                      </TableCell>

                      <TableCell className={`${colWidthMontant} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className={`whitespace-nowrap truncate`} style={fontSizeStyle}>{receipt.montant ? `${receipt.montant} DZD` : ''}</div>
                      </TableCell>

                      <TableCell className={`${colWidthDate} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <span className="whitespace-nowrap">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : ''}</span>
                      </TableCell>

                      <TableCell className={`${colWidthStatus} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        {getStatusBadge(receipt.status)}
                      </TableCell>

                      <TableCell className={`${colWidthActions} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                          {/* If payment is validated, no actions should be shown */}
                          {!(receipt.status && ['validee', 'validated', 'valid'].includes(String(receipt.status).toLowerCase())) && (
                            <>
                              {onEditReceipt ? (
                                <Button size="sm" variant="outline" className={`flex items-center justify-center rounded-md border border-border`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onEditReceipt(receipt)}>
                                  <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                                </Button>
                              ) : onConsultReceipt && (
                                <Button size="sm" variant="outline" className={`flex items-center justify-center rounded-md border border-border`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onConsultReceipt(receipt)}>
                                  <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                                </Button>
                              )}
                              {onDeleteReceipt && (
                                <Button size="sm" variant="outline" className={`flex items-center justify-center rounded-md border border-border text-red-600 hover:text-red-700`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onDeleteReceipt(receipt.id)}>
                                  <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                                </Button>
                              )}
                              {/* Validate button for cashier flows (parent passes handler) */}
                              {onValidateReceipt && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className={`flex items-center justify-center rounded-md border border-border text-green-600 hover:text-green-700`}
                                  style={{ width: computedRowPx, height: computedRowPx }}
                                  onClick={() => onValidateReceipt(receipt)}
                                >
                                  <Check style={{ width: computedIconPx, height: computedIconPx }} />
                                </Button>
                              )}
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PaymentReceiptsTable;
