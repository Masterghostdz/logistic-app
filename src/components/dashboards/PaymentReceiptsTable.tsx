import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, Search } from 'lucide-react';
import useTableZoom from '../../hooks/useTableZoom';
import { PaymentReceipt } from '../../types';

interface PaymentReceiptsTableProps {
  receipts: PaymentReceipt[];
  onDeleteReceipt?: (id: string) => void;
  onConsultReceipt?: (receipt: PaymentReceipt) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const PaymentReceiptsTable: React.FC<PaymentReceiptsTableProps> = ({ receipts, onDeleteReceipt, onConsultReceipt, fontSize = '80' }) => {
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
    zoomGlobal
  } = useTableZoom(fontSize as any);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'brouillon' | 'validee'>('all');

  // Use getMinWidthForChars primarily to match DeclarationsTable sizing (avoids big gaps)
  const colWidthPhoto = `${getMinWidthForChars(8)} min-w-[72px]`;
  const colWidthRef = `${getMinWidthForChars(12)}`;
  const colWidthCompany = `${getMinWidthForChars(14)}`;
  const colWidthDate = `${getMinWidthForChars(12)}`;
  const colWidthStatus = `${getMinWidthForChars(8)} w-[90px]`;
  const colWidthActions = `${getMinWidthForChars(8)} w-[${Math.max(72, Math.round(4 * 24 * zoomGlobal))}px]`;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'brouillon':
        return <Badge size="md" style={{ ...badgeStyle }} className={`bg-yellow-100 text-yellow-800 ${badgeClass}`}>{t('dashboard.pending') || 'Brouillon'}</Badge>;
      case 'validee':
        return <Badge size="md" style={{ ...badgeStyle }} className={`bg-green-100 text-green-800 ${badgeClass}`}>{t('dashboard.validated') || 'Validée'}</Badge>;
      default:
        return <Badge size="md" variant="outline" style={{ ...badgeStyle }} className={badgeClass}>{status}</Badge>;
    }
  };

  // Filtrage local (recherche + statut)
  const filteredReceipts = receipts.filter(r => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      (r.programReference && r.programReference.toLowerCase().includes(s)) ||
      (r.companyName && r.companyName.toLowerCase().includes(s)) ||
      (r.id && r.id.toLowerCase().includes(s))
    );
  });

  return (
    <div className="w-full px-1">
      {/* Barre recherche / filtre (hors Card) + zoom à droite */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <div className="flex items-center gap-2 border rounded px-2 py-1 bg-background">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={t('declarations.searchPlaceholder') || 'Rechercher...'}
              className="text-xs bg-transparent outline-none placeholder:text-muted-foreground"
              style={{ minWidth: 160 }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as any)}
            className="border rounded px-2 py-1 text-xs bg-background"
            title="Filtrer par état"
          >
            <option value="all">Tous</option>
            <option value="brouillon">Brouillon</option>
            <option value="validee">Validée</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <label className="mr-2 text-xs text-muted-foreground">Zoom :</label>
          <select
            value={localFontSize}
            onChange={e => setLocalFontSize(e.target.value as typeof localFontSize)}
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
      </div>

      <div className="w-full overflow-x-auto">
        <Card>
          <CardContent className="p-0">
            <Table data-rtl={settings.language === 'ar'}>
              <TableHeader data-rtl={settings.language === 'ar'}>
                <TableRow className={rowHeight}>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthPhoto} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('forms.photo') || 'Photo'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthRef} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.programNumber') || 'Référence'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthCompany} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('companies.name') || 'Société'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthDate} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.createdDate') || 'Date de création'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthStatus} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.status') || 'État'}</TableHead>
                  <TableHead data-rtl={settings.language === 'ar'} className={`${colWidthActions} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('declarations.actions') || 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>

              <TableBody data-rtl={settings.language === 'ar'}>
                {filteredReceipts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className={`text-center text-muted-foreground text-sm py-8 ${cellPaddingClass}`}>{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</TableCell>
                  </TableRow>
                ) : (
                  filteredReceipts.map(receipt => (
                    <TableRow key={receipt.id} className={rowHeight}>
                      <TableCell className={`${colWidthPhoto} ${cellPaddingClass}`} style={fontSizeStyle}>
                        <img src={receipt.photoUrl} alt="reçu" className="w-20 h-12 object-cover rounded" />
                      </TableCell>

                      <TableCell className={`${colWidthRef} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle} onClick={() => onConsultReceipt && onConsultReceipt(receipt)}>
                        <div className={`cursor-pointer font-medium whitespace-nowrap truncate`} style={fontSizeStyle}>{receipt.programReference}</div>
                      </TableCell>

                      <TableCell className={`${colWidthCompany} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className={`whitespace-nowrap truncate`} style={fontSizeStyle}>{receipt.companyName}</div>
                      </TableCell>

                      <TableCell className={`${colWidthDate} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <span className="whitespace-nowrap">{new Date(receipt.createdAt).toLocaleString()}</span>
                      </TableCell>

                      <TableCell className={`${colWidthStatus} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        {getStatusBadge(receipt.status)}
                      </TableCell>

                      <TableCell className={`${colWidthActions} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                        <div className="flex gap-1 whitespace-nowrap" style={fontSizeStyle}>
                          {onConsultReceipt && (
                            <Button size="sm" variant="outline" className={`p-0 ${iconSize}`} onClick={() => onConsultReceipt(receipt)}>
                              <Edit className={`${iconSize} min-w-0`} />
                            </Button>
                          )}
                          {onDeleteReceipt && (
                            <Button size="sm" variant="outline" className={`p-0 ${iconSize} text-red-600`} onClick={() => onDeleteReceipt(receipt.id)}>
                              <Trash2 className={`${iconSize} min-w-0`} />
                            </Button>
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
