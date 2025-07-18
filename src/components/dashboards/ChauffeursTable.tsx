
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
}

const ChauffeursTable = ({ chauffeurs, onEditChauffeur, onDeleteChauffeur }: ChauffeursTableProps) => {
  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px]">Nom complet</TableHead>
              <TableHead className="w-[100px]">Utilisateur</TableHead>
              <TableHead className="w-[90px]">Mot de passe</TableHead>
              <TableHead className="w-[120px]">Téléphone</TableHead>
              <TableHead className="w-[100px]">Véhicule</TableHead>
              <TableHead className="w-[60px]">Type</TableHead>
              <TableHead className="w-[60px]">Statut</TableHead>
              <TableHead className="w-[80px]">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {chauffeurs.map((chauffeur) => (
              <TableRow key={chauffeur.id}>
                <TableCell className="font-medium">
                  <div className="truncate text-sm">
                    {chauffeur.employeeType === 'externe' ? 'TP - ' : ''}{chauffeur.firstName} {chauffeur.lastName}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="truncate text-sm">{chauffeur.username}</div>
                </TableCell>
                <TableCell>
                  <span className="font-mono text-sm select-none">••••••••</span>
                </TableCell>
                <TableCell>
                  <div className="space-y-1">
                    {chauffeur.phone.map((p, index) => (
                      <div key={index} className="text-sm truncate">{p}</div>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-sm truncate">{chauffeur.vehicleType || '-'}</div>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={chauffeur.employeeType === 'interne' ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {chauffeur.employeeType === 'interne' ? 'Int.' : 'Ext.'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={chauffeur.isActive ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {chauffeur.isActive ? 'Actif' : 'Inactif'}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => onEditChauffeur(chauffeur)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-7 w-7 p-0"
                      onClick={() => onDeleteChauffeur(chauffeur.id)}
                    >
                      <Trash2 className="h-3 w-3" />
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
