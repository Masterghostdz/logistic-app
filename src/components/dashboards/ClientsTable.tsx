import React, { useState, useMemo, useEffect } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, ZoomIn, MapPin, Check } from 'lucide-react';
import PaginationControls from '../ui/PaginationControls';
import { useTranslation } from '../../hooks/useTranslation';
import { Client } from '../../types/client';
import useTableZoom from '../../hooks/useTableZoom';

interface ClientsTableProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onConsultClient?: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onZoomClient: (client: Client) => void;
  onValidateClient?: (client: Client) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const ClientsTable = ({ clients, onEditClient, onConsultClient, onDeleteClient, onZoomClient, onValidateClient, fontSize = '80' }: ClientsTableProps) => {
  const { t } = useTranslation();
  // Use the table zoom hook directly so the selector controls the shared zoom helpers
  const { localFontSize, setLocalFontSize, fontSizeStyle, rowHeight, iconSize, badgeClass, badgeStyle, cellPaddingClass, getMinWidthForChars, computedRowPx, computedIconPx } = useTableZoom(fontSize as any);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(20);
  // compute current page rows
  const pageRows = useMemo(() => {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return (clients || []).slice(start, end);
  }, [clients, page, perPage]);

  useEffect(() => {
    const totalPages = Math.max(1, Math.ceil((clients?.length || 0) / perPage));
    if (page > totalPages) setPage(totalPages);
    if (page < 1) setPage(1);
  }, [clients, perPage]);
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
            <option value="70">70%</option>
            <option value="60">60%</option>
          </select>
          <div className="ml-3">
            <PaginationControls page={page} perPage={perPage} onPageChange={setPage} onPerPageChange={(n) => { setPerPage(n); setPage(1); }} totalItems={clients.length} />
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow style={fontSizeStyle}>
              <TableHead className={`${getMinWidthForChars(14)} ${cellPaddingClass} whitespace-normal`} style={fontSizeStyle}>{t('clients.name')}</TableHead>
              <TableHead className={`${getMinWidthForChars(10)} ${cellPaddingClass} whitespace-normal`} style={fontSizeStyle}>{t('forms.mobile')}</TableHead>
              <TableHead className={`${getMinWidthForChars(12)} ${cellPaddingClass} whitespace-normal`} style={fontSizeStyle}>{t('clients.creator')}</TableHead>
              <TableHead className={`${getMinWidthForChars(8)} ${cellPaddingClass} whitespace-normal`} style={fontSizeStyle}>{t('clients.status')}</TableHead>
              <TableHead className={`${getMinWidthForChars(8)} ${cellPaddingClass} whitespace-normal`} style={fontSizeStyle}>{t('clients.actions')}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageRows.map((client) => (
              <TableRow key={client.id} className={rowHeight} style={fontSizeStyle}>
                <TableCell className={`font-medium ${cellPaddingClass}`} style={fontSizeStyle}>
                  <button
                    type="button"
                    className="truncate text-sm text-blue-600 hover:underline bg-transparent border-0 p-0 m-0 cursor-pointer"
                    style={fontSizeStyle}
                    onClick={() => onConsultClient ? onConsultClient(client) : onEditClient(client)}
                  >
                    {client.name}
                  </button>
                </TableCell>
                <TableCell className={`${cellPaddingClass}`} style={fontSizeStyle}>
                  <div className="truncate text-sm" style={fontSizeStyle}>{client.mobile || <span className="text-xs text-muted-foreground">-</span>}</div>
                </TableCell>
                <TableCell className={`${cellPaddingClass}`} style={fontSizeStyle}>
                  {client.createur ? (
                    <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">{client.createur}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className={`${cellPaddingClass}`} style={fontSizeStyle}>
                  {client.status === 'pending' && (
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-300 dark:bg-blue-900 dark:text-blue-200`}>Créé</Badge>
                  )}
                  {client.status === 'validated' && (
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} rounded-full font-semibold bg-green-100 text-green-800 border border-green-300 dark:bg-green-900 dark:text-green-200`}>Validé</Badge>
                  )}
                  {client.status === 'modifie' && (
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} rounded-full font-semibold bg-yellow-100 text-yellow-800 border border-yellow-300 dark:bg-yellow-900 dark:text-yellow-200`}>Modifié</Badge>
                  )}
                  {client.status === 'rejected' && (
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} rounded-full font-semibold bg-red-100 text-red-800 border border-red-300 dark:bg-red-900 dark:text-red-200`}>Rejeté</Badge>
                  )}
                  {client.status === 'archived' && (
                <Badge size="md" style={{ ...badgeStyle }} className={`${badgeClass} rounded-full font-semibold bg-gray-100 text-gray-800 border border-gray-300 dark:bg-gray-900 dark:text-gray-200`}>Archivé</Badge>
                  )}
                </TableCell>
                <TableCell className={`${cellPaddingClass}`} style={fontSizeStyle}>
                  <div className="flex gap-1" style={fontSizeStyle}>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex items-center justify-center rounded-md border border-border`}
                      style={{ width: computedRowPx, height: computedRowPx }}
                      onClick={() => onZoomClient(client)}
                      title={t('clients.viewOnMap')}
                    >
                      <MapPin style={{ width: computedIconPx, height: computedIconPx }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex items-center justify-center rounded-md border border-border`}
                      style={{ width: computedRowPx, height: computedRowPx }}
                      onClick={() => onEditClient(client)}
                      title={t('forms.edit')}
                    >
                      <Edit style={{ width: computedIconPx, height: computedIconPx }} />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className={`flex items-center justify-center rounded-md border border-border text-red-600 hover:text-red-700`}
                      style={{ width: computedRowPx, height: computedRowPx }}
                      onClick={() => onDeleteClient(client.id)}
                      title={t('forms.delete')}
                    >
                      <Trash2 style={{ width: computedIconPx, height: computedIconPx }} />
                    </Button>
                    {client.status === 'pending' && onValidateClient && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={`flex items-center justify-center rounded-md border border-border text-green-600 hover:text-green-700`}
                        style={{ width: computedRowPx, height: computedRowPx }}
                        onClick={() => onValidateClient(client)}
                        title={t('clients.validate')}
                      >
                        <Check style={{ width: computedIconPx, height: computedIconPx }} />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientsTable;
