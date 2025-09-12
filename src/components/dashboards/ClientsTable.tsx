import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2, ZoomIn, MapPin, Check } from 'lucide-react';
import { Client } from '../../types/client';

interface ClientsTableProps {
  clients: Client[];
  onEditClient: (client: Client) => void;
  onConsultClient?: (client: Client) => void;
  onDeleteClient: (id: string) => void;
  onZoomClient: (client: Client) => void;
  onValidateClient?: (client: Client) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const ClientsTable = ({ clients, onEditClient, onConsultClient, onDeleteClient, onZoomClient, onValidateClient, fontSize = '100' }: ClientsTableProps) => {
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
  const badgeFontSize = { fontSize: `${Math.round(100 * zoom)}%` };
  const rowHeight = `h-[${Math.round(40 * zoom)}px]`;
  const baseIcon = 18;
  const zoomGlobal = zoomLevels[String(localFontSize)] ?? 1.0;
  const iconSize = `h-[${Math.round(baseIcon * zoomGlobal)}px] w-[${Math.round(baseIcon * zoomGlobal)}px]`;
  // Correction portée props
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
              <TableHead className="w-[140px]" style={fontSizeStyle}>Nom</TableHead>
              <TableHead className="w-[120px]" style={fontSizeStyle}>Mobile</TableHead>
              <TableHead className="w-[140px]" style={fontSizeStyle}>Créateur</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>Statut</TableHead>
              <TableHead className="w-[80px]" style={fontSizeStyle}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {clients.map((client) => (
              <TableRow key={client.id} className={rowHeight} style={fontSizeStyle}>
                <TableCell className="font-medium" style={fontSizeStyle}>
                  <button
                    type="button"
                    className="truncate text-sm text-blue-600 hover:underline bg-transparent border-0 p-0 m-0 cursor-pointer"
                    style={fontSizeStyle}
                    onClick={() => onConsultClient ? onConsultClient(client) : onEditClient(client)}
                  >
                    {client.name}
                  </button>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="truncate text-sm" style={fontSizeStyle}>{client.mobile || <span className="text-xs text-muted-foreground">-</span>}</div>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  {client.createur ? (
                    <span className="truncate text-sm font-semibold text-gray-800 dark:text-gray-200">{client.createur}</span>
                  ) : (
                    <span className="text-xs text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  {client.status === 'pending' && (
                    <Badge className="rounded-full font-semibold bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" style={badgeFontSize}>Créé</Badge>
                  )}
                  {client.status === 'validated' && (
                    <Badge className="rounded-full font-semibold bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" style={badgeFontSize}>Validé</Badge>
                  )}
                  {client.status === 'modifie' && (
                    <Badge className="rounded-full font-semibold bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" style={badgeFontSize}>Modifié</Badge>
                  )}
                  {client.status === 'rejected' && (
                    <Badge className="rounded-full font-semibold bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" style={badgeFontSize}>Rejeté</Badge>
                  )}
                  {client.status === 'archived' && (
                    <Badge className="rounded-full font-semibold bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200" style={badgeFontSize}>Archivé</Badge>
                  )}
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="flex gap-1" style={fontSizeStyle}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`p-0 ${iconSize} min-w-0`}
                      onClick={() => onZoomClient(client)}
                      title="Voir sur la carte"
                    >
                      <MapPin className={`${iconSize} min-w-0`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`p-0 ${iconSize} min-w-0`}
                      onClick={() => onEditClient(client)}
                      title="Modifier"
                    >
                      <Edit className={`${iconSize} min-w-0`} />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className={`p-0 ${iconSize} min-w-0 text-red-600 hover:text-red-700`}
                      onClick={() => onDeleteClient(client.id)}
                      title="Supprimer"
                    >
                      <Trash2 className={`${iconSize} min-w-0`} />
                    </Button>
                    {client.status === 'pending' && onValidateClient && (
                      <Button
                        size="sm"
                        variant="outline"
                        className={`p-0 text-green-600 hover:text-green-700 ${iconSize}`}
                        onClick={() => onValidateClient(client)}
                        title="Valider le client"
                      >
                        <Check className={`${iconSize} min-w-0`} />
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
