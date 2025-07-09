
import React from 'react';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { Check, X, Edit, Trash2 } from 'lucide-react';
import { Declaration } from '../../types';
import CopyButton from '../CopyButton';

interface DeclarationsTableProps {
  declarations: Declaration[];
  onValidateDeclaration: (id: string) => void;
  onRejectDeclaration: (id: string) => void;
  onEditDeclaration: (declaration: Declaration) => void;
  onDeleteDeclaration: (id: string) => void;
}

const DeclarationsTable = ({ 
  declarations, 
  onValidateDeclaration, 
  onRejectDeclaration, 
  onEditDeclaration, 
  onDeleteDeclaration 
}: DeclarationsTableProps) => {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 text-xs whitespace-nowrap">En Attente</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 text-xs whitespace-nowrap">Validé</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800 text-xs whitespace-nowrap">Refusé</Badge>;
      default:
        return <Badge variant="outline" className="text-xs whitespace-nowrap">{status}</Badge>;
    }
  };

  return (
    <Card>
      <CardContent className="p-0">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[140px] text-xs">Numéro</TableHead>
              <TableHead className="w-[130px] text-xs">Chauffeur</TableHead>
              <TableHead className="w-[100px] text-xs">Distance (km)</TableHead>
              <TableHead className="w-[120px] text-xs">Frais (DZD)</TableHead>
              <TableHead className="w-[120px] text-xs">Créé le</TableHead>
              <TableHead className="w-[120px] text-xs">Validé le</TableHead>
              <TableHead className="w-[100px] text-xs">État</TableHead>
              <TableHead className="w-[120px] text-xs">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {declarations.map((declaration) => (
              <TableRow key={declaration.id}>
                <TableCell className="font-medium">
                  <div className="truncate text-xs">{declaration.number}</div>
                </TableCell>
                <TableCell>
                  <div className="truncate text-xs">{declaration.chauffeurName}</div>
                </TableCell>
                <TableCell className="text-center text-xs">
                  {declaration.distance ? (
                    <div className="flex items-center gap-1">
                      <span>{declaration.distance.toFixed(2)}</span>
                      <CopyButton value={Math.floor(declaration.distance).toString()} />
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right text-xs">
                  {declaration.deliveryFees ? (
                    <div className="flex items-center gap-1">
                      <span>{declaration.deliveryFees.toFixed(2)} DZD</span>
                      <CopyButton value={Math.floor(declaration.deliveryFees).toString()} />
                    </div>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-xs">
                  {new Date(declaration.createdAt).toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric'
                  })}
                </TableCell>
                <TableCell className="text-xs">
                  {declaration.validatedAt 
                    ? new Date(declaration.validatedAt).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                      })
                    : '-'
                  }
                </TableCell>
                <TableCell>{getStatusBadge(declaration.status)}</TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => onEditDeclaration(declaration)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="h-6 w-6 p-0"
                      onClick={() => onDeleteDeclaration(declaration.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                    {declaration.status === 'en_cours' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0 text-green-600 hover:text-green-700"
                          onClick={() => onValidateDeclaration(declaration.id)}
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="h-6 w-6 p-0 text-red-600 hover:text-red-700"
                          onClick={() => onRejectDeclaration(declaration.id)}
                        >
                          <X className="h-3 w-3" />
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
  );
};

export default DeclarationsTable;
