import React, { useState } from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { Chauffeur } from '../../types';
import PasswordField from '../PasswordField';

interface ChauffeursTableProps {
  chauffeurs: Chauffeur[];
  onEditChauffeur: (chauffeur: Chauffeur) => void;
  onDeleteChauffeur: (id: string) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const ChauffeursTable = ({ chauffeurs, onEditChauffeur, onDeleteChauffeur, fontSize = '100' }: ChauffeursTableProps) => {
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
              <TableHead className="w-[140px]" style={fontSizeStyle}>Nom complet</TableHead>
              <TableHead className="w-[100px]" style={fontSizeStyle}>Utilisateur</TableHead>
              <TableHead className="w-[90px]" style={fontSizeStyle}>Mot de passe</TableHead>
              <TableHead className="w-[120px]" style={fontSizeStyle}>Téléphone</TableHead>
              <TableHead className="w-[100px]" style={fontSizeStyle}>Véhicule</TableHead>
              <TableHead className="w-[60px]" style={fontSizeStyle}>Type</TableHead>
              <TableHead className="w-[60px]" style={fontSizeStyle}>Statut</TableHead>
              <TableHead className="w-[80px]" style={fontSizeStyle}>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chauffeurs.map((chauffeur) => (
              <TableRow key={chauffeur.id} className={rowHeight} style={fontSizeStyle}>
                <TableCell className="font-medium" style={fontSizeStyle}>
                  <div className="truncate text-sm" style={fontSizeStyle}>
                    {chauffeur.employeeType === 'externe' ? 'TP - ' : ''}{chauffeur.firstName} {chauffeur.lastName}
                  </div>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="truncate text-sm" style={fontSizeStyle}>{chauffeur.username}</div>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <span className="tracking-widest text-lg select-none" aria-label="Mot de passe masqué" style={fontSizeStyle}>••••••••</span>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="space-y-1" style={fontSizeStyle}>
                    {chauffeur.phone.map((p, index) => (
                      <div key={index} className="text-sm truncate" style={fontSizeStyle}>{p}</div>
                    ))}
                  </div>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="text-sm truncate" style={fontSizeStyle}>{chauffeur.vehicleType || '-'}</div>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <Badge 
                    variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}
                    className="text-xs"
                    style={fontSizeStyle}
                  >
                    {chauffeur.employeeType === 'interne' ? 'Int.' : 'Ext.'}
                  </Badge>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <Badge 
                    variant={chauffeur.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                    style={fontSizeStyle}
                  >
                    {chauffeur.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell style={fontSizeStyle}>
                  <div className="flex gap-1" style={fontSizeStyle}>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => onEditChauffeur(chauffeur)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="destructive"
                      className="h-7 w-7 p-0"
                      onClick={() => onDeleteChauffeur(chauffeur.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
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

export default ChauffeursTable;
