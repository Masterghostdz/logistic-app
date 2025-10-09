import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, Check } from 'lucide-react';
import useTableZoom from '../../hooks/useTableZoom';
import { PaymentReceipt } from '../../types';
import { toast } from '../ui/use-toast';
import { useAuth } from '../../contexts/AuthContext';
import SearchAndFilter from '../SearchAndFilter';

interface PaymentReceiptsTableProps {
  receipts: PaymentReceipt[];
  onDeleteReceipt?: (id: string, skipConfirmation?: boolean) => void;
  onConsultReceipt?: (receipt: PaymentReceipt) => void;
  onEditReceipt?: (receipt: PaymentReceipt) => void;
  onValidateReceipt?: (receipt: PaymentReceipt) => void;
  // hide the edit button (for external caissier)
  hideEditButton?: boolean;
  // Optional selection support to mirror DeclarationsTable
  selectedReceiptIds?: string[];
  setSelectedReceiptIds?: (ids: string[]) => void;
  mobile?: boolean;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
  initialStatusFilter?: 'all' | 'brouillon' | 'validee';
  initialCompanyFilter?: 'all' | 'no-company';
  mode?: 'default' | 'recouvrement';
  // Optional reset key: when this number changes, the component will reapply initial* filters.
  resetKey?: number;
}

const PaymentReceiptsTable: React.FC<PaymentReceiptsTableProps> = ({
  receipts,
  onDeleteReceipt,
  onConsultReceipt,
  onEditReceipt,
  onValidateReceipt,
  selectedReceiptIds = [],
  setSelectedReceiptIds,
  fontSize = '80',
  initialStatusFilter = 'all',
  initialCompanyFilter = 'all',
  mode = 'default'
  , hideEditButton = false,
  resetKey
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
  const auth = useAuth();

  const [search, setSearch] = useState('');
  // Only allow search by programReference (numéro de programme)
  const [searchColumn, setSearchColumn] = useState<'programReference'>('programReference');
  const [statusFilter, setStatusFilter] = useState<'all' | 'brouillon' | 'validee'>(initialStatusFilter || 'all');
  const [companyFilter, setCompanyFilter] = useState<'all' | 'no-company'>(initialCompanyFilter || 'all');
  // Apply initial filters on mount and whenever resetKey changes.
  // This avoids overwriting user changes when parent updates initial* values for other reasons.
  React.useEffect(() => {
    setStatusFilter(initialStatusFilter || 'all');
    setCompanyFilter(initialCompanyFilter || 'all');
  }, [resetKey]);

  // If in recouvrement mode, statusFilter is not payment status but recouvrement filter.
  // We don't change internal state here; the parent should set initialStatusFilter appropriately when switching modes.

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
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200 ${badgeClass}`}>{t('dashboard.pending') || 'Brouillon'}</Badge>;
    }
    if (['validee', 'validated', 'valid'].includes(s)) {
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200 ${badgeClass}`}>{t('dashboard.validated') || 'Validée'}</Badge>;
    }
    if (['refuse', 'refused', 'rejected'].includes(s)) {
      return <Badge size="md" style={{ ...badgeStyle }} className={`bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200 ${badgeClass}`}>{t('declarations.refused') || 'Refusé'}</Badge>;
    }
    return <Badge size="md" variant="outline" style={{ ...badgeStyle }} className={badgeClass}>{status}</Badge>;
  };

  // Filtrage local (recherche + statut)
  const filteredReceipts = receipts.filter(r => {
    // company filter (from stats click) — consider both companyId and companyName empty
    if (companyFilter === 'no-company') {
      const hasCompanyId = !!(r.companyId);
      const hasCompanyName = !!(r.companyName && String(r.companyName).trim().length > 0);
      if (hasCompanyId || hasCompanyName) return false; // exclude receipts that have a company
    }
    // statusFilter normally filters by receipt.status (brouillon/validee)
    if (statusFilter !== 'all' && ['brouillon', 'validee'].includes(statusFilter) && r.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return !!(r.programReference && r.programReference.toLowerCase().includes(s));
  });

  return (
    <div className="w-full px-0">
      {/* Barre recherche / filtre (hors Card) */}
  <div className="mb-2">
        <SearchAndFilter
          searchValue={search}
          onSearchChange={setSearch}
          filterValue={statusFilter}
          onFilterChange={(v) => setStatusFilter(v as any)}
          filterOptions={mode === 'recouvrement' ? [
            { value: 'recouvre', label: t('declarations.recovered') || 'Recouvré' },
            { value: 'non_recouvre', label: t('declarations.notRecovered') || 'Non Recouvré' }
          ] : [
            { value: 'brouillon', label: t('dashboard.pending') || 'Brouillon' },
            { value: 'validee', label: t('dashboard.validated') || 'Validé' }
          ]}
          searchColumn={searchColumn}
          onSearchColumnChange={() => {}}
          searchColumnOptions={[
            { value: 'programReference', label: t('declarations.programNumber') || 'Numéro de programme' }
          ]}
          searchPlaceholder={t('declarations.searchPlaceholder') || t('common.searchPlaceholder') || 'Rechercher...'}
          filterPlaceholder={t('declarations.filterPlaceholder') || t('common.filterPlaceholder') || 'Filtrer...'}
        />
      </div>

      <div className="w-full overflow-x-auto">
        <Card className="w-full min-w-full rounded-lg border border-border bg-card">
          <CardContent className="p-0">
            {/* Header inside the framed card: zoom selector on the right */}
            <div className="flex items-center justify-end px-3 py-2 border-b border-border">
              <label className="mr-2 text-xs text-muted-foreground">{t('common.zoom') || 'Zoom'} :</label>
              <select
                value={localFontSize}
                onChange={e => setLocalFontSize(e.target.value as any)}
                className="border rounded px-2 py-0.5 text-xs bg-background"
                title={t('common.zoom') || 'Zoom'}
              >
                <option value="100">100%</option>
                <option value="90">90%</option>
                <option value="80">80%</option>
                <option value="70">70%</option>
                <option value="60">60%</option>
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
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthCompany} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{'Société'}</TableHead>
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
                        <div className="border border-border rounded overflow-hidden">
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
                        <div className={`whitespace-nowrap truncate`} style={fontSizeStyle}>{typeof receipt.montant === 'number' ? `${receipt.montant.toFixed(2)}` : ''}</div>
                      </TableCell>

                      <TableCell className={`${colWidthDate} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <span className="whitespace-nowrap">{receipt.createdAt ? new Date(receipt.createdAt).toLocaleDateString() : ''}</span>
                      </TableCell>

                      <TableCell className={`${colWidthStatus} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        {getStatusBadge(receipt.status)}
                      </TableCell>

                      <TableCell className={`${colWidthActions} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                          {/* Determine actions depending on status (including new 'annule') */}
                          {(() => {
                            const st = String(receipt.status || '').toLowerCase();
                            const isPending = ['brouillon', 'pending'].includes(st);
                            const isValidated = ['validee', 'validated', 'valide', 'valid'].includes(st);
                            const isCancelled = ['annule', 'annulé', 'cancelled'].includes(st);
                            // Only internal cashiers may perform payment annulment (undo)
                            const isInternalCaissier = !!(auth.user && auth.user.role === 'caissier' && auth.user.employeeType === 'interne');
                            // If validated, show Undo (Annuler) button so caissier can revert to brouillon
                            if (isValidated) {
                              // If user is not internal cashier, hide undo button
                              if (!isInternalCaissier) return null;

                              return (
                                <Button
                                  key="undo-validated"
                                  title={t('payments.undo') || 'Annuler'}
                                  size="sm"
                                  variant="ghost"
                                  className={`flex items-center justify-center rounded-md text-yellow-600 hover:bg-yellow-50 dark:hover:bg-yellow-900`}
                                  style={{ width: computedRowPx, height: computedRowPx }}
                                  onClick={async () => {
                                    try {
                                      const { updatePayment, getPayments } = await import('../../services/paymentService');
                                      const traceEntry = { userId: auth.user?.id || null, userName: auth.user?.fullName || null, action: t('traceability.revokedValidation') || 'Annulation validation', date: new Date().toISOString() };
                                      // Try to append traceability when possible
                                      try {
                                        const current: any = (await getPayments()).find((p: any) => p.id === receipt.id) || {};
                                        const newTrace = [...(current.traceability || []), traceEntry];
                                        await updatePayment(receipt.id, { status: 'brouillon', traceability: newTrace });
                                      } catch (e) {
                                        await updatePayment(receipt.id, { status: 'brouillon' });
                                      }
                                      toast({ title: t('payments.undone') || 'Statut annulé' });
                                    } catch (e) {
                                      console.error('Undo failed', e);
                                      toast({ title: t('forms.error') || 'Erreur lors de l\'opération', variant: 'destructive' });
                                    }
                                  }}
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ width: computedIconPx, height: computedIconPx }}>
                                    <path d="M21 12a9 9 0 10-9 9" />
                                    <path d="M21 3v9h-9" />
                                  </svg>
                                </Button>
                              );
                            }
                            return (
                              <>
                                {/* Edit allowed only when not cancelled and when edit isn't hidden */}
                                {!isCancelled && !hideEditButton && (onEditReceipt ? (
                                  <Button size="sm" variant="outline" className={`flex items-center justify-center rounded-md border border-border`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onEditReceipt(receipt)}>
                                    <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                                  </Button>
                                ) : onConsultReceipt && (
                                  <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onConsultReceipt(receipt)}>
                                    <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                                  </Button>
                                ))}

                                {/* Delete: allowed when parent provided, even for cancelled or pending (service will refuse validated) */}
                                {onDeleteReceipt && (
                                  <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md text-red-600 hover:text-red-700`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onDeleteReceipt(receipt.id)}>
                                    <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                                  </Button>
                                )}

                                {/* Validate: allowed when pending (brouillon/pending) and NOT when cancelled */}
                                {onValidateReceipt && isPending && !isCancelled && (
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className={`flex items-center justify-center rounded-md text-green-600 hover:text-green-700`}
                                    style={{ width: computedRowPx, height: computedRowPx }}
                                    onClick={() => onValidateReceipt(receipt)}
                                  >
                                    <Check style={{ width: computedIconPx, height: computedIconPx }} />
                                  </Button>
                                )}
                              </>
                            );
                          })()}
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
