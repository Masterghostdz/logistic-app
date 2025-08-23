
import React from 'react';
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
  // Système de zoom comme DeclarationsTable
  const zoomLevels: Record<string, number> = {
    '40': 0.7,
    '50': 0.8,
    '60': 0.85,
    '70': 0.9,
    '80': 0.95,
    '90': 1.0,
    '100': 1.05
  };
    const zoom = zoomLevels[String(fontSize)] ?? 1.0; // Correction : fontSize est bien reçu en paramètre
  const fontSizeStyle = { fontSize: `${Math.round(14 * zoom)}px` };
  const rowHeight = `h-[${Math.round(40 * zoom)}px]`;
  return (
    <Card>
      <CardContent className="p-0">
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
