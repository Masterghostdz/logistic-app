import React, { useState, useMemo, useEffect } from "react";
import { useTranslation } from '../../hooks/useTranslation';
import { Warehouse } from "../../types";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "../ui/dialog";
import PaginationControls from '../ui/PaginationControls';
import useTableZoom from '../../hooks/useTableZoom';

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onCreate: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onConsult: (warehouse: Warehouse) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({ warehouses, onCreate, onEdit, onDelete, onConsult, fontSize = '80' }) => {
  const { t } = useTranslation();
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
    computedRowPx,
    computedIconPx
  } = useTableZoom(fontSize as any);
  // Le parent gère la recherche et le filtre, ici on affiche tout
  const filtered = warehouses;

  // Pagination local (client-side). Parent can switch to server-side if needed.
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);

  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return (filtered || []).slice(start, end);
  }, [filtered, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((filtered?.length || 0) / perPage));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [filtered, perPage]);

  // iconSize and spacing provided by useTableZoom
  return (
    <>
      <div className="flex items-center justify-end mb-2 gap-4">
        {/* Sélecteur de zoom */}
        <div className="flex items-center">
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
            <option value="70">70%</option>
            <option value="60">60%</option>
          </select>
        </div>

        {/* Pagination controls (client-side) */}
        <PaginationControls
          page={page}
          perPage={perPage}
          onPageChange={p => setPage(p)}
          onPerPageChange={pp => { setPerPage(pp); setPage(1); }}
          totalItems={filtered.length}
        />
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className={rowHeight} style={fontSizeStyle}>
              <TableHead className={`${getMinWidthForChars(12)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.name') || 'Nom'}</TableHead>
              <TableHead className={`${getMinWidthForChars(10)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.company') || 'Société'}</TableHead>
              <TableHead className={`${getMinWidthForChars(8)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.phone') || 'Téléphone'}</TableHead>
              <TableHead className={`${getMinWidthForChars(18)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.address') || 'Adresse'}</TableHead>
              <TableHead className={`${getMinWidthForChars(6)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.status') || 'Statut'}</TableHead>
              <TableHead className={`${getMinWidthForChars(8)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{t('warehouses.actions') || 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-muted-foreground text-center py-4">Aucun entrepôt trouvé.</TableCell>
              </TableRow>
            ) : (
              pageRows.map(wh => (
                <TableRow key={wh.id} className={rowHeight} style={fontSizeStyle}>
                  <TableCell className={`font-medium cursor-pointer hover:underline ${getMinWidthForChars(12)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle} onClick={() => onConsult(wh)}>
                    {wh.name}
                  </TableCell>
                  <TableCell className={`${getMinWidthForChars(10)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{wh.companyName}</TableCell>
                  <TableCell className={`${getMinWidthForChars(8)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{wh.phone && wh.phone.length > 0 ? wh.phone[0] : '-'}</TableCell>
                  <TableCell className={`${getMinWidthForChars(18)} ${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>{wh.address}</TableCell>
                  <TableCell className={`${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                    {wh.isActive ? (
                      <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} font-semibold bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200`}>{t('warehouses.active') || t('chauffeurs.active') || 'Actif'}</Badge>
                    ) : (
                      <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200`}>{t('warehouses.inactive') || t('chauffeurs.inactive') || 'Inactif'}</Badge>
                    )}
                  </TableCell>
                  <TableCell className={`${cellPaddingClass} whitespace-nowrap`} style={fontSizeStyle}>
                    <div className="flex gap-1" style={fontSizeStyle}>
                      <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onConsult(wh)} title="Consulter">
                        <Eye style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                      <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onEdit(wh)} title={t('forms.edit') || 'Modifier'}>
                        <Pencil style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                      <Button size="sm" variant="ghost" className={`flex items-center justify-center rounded-md text-red-600 hover:text-red-700`} style={{ width: computedRowPx, height: computedRowPx }} onClick={() => onDelete(wh)} title="Supprimer">
                        <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </>
  );
};

export default WarehouseTable;
