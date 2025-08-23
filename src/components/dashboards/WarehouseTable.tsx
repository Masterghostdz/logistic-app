import React, { useState } from "react";
import { Warehouse } from "../../types";
import { Eye, Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { Card, CardContent } from "../ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "../ui/table";

interface WarehouseTableProps {
  warehouses: Warehouse[];
  onCreate: () => void;
  onEdit: (warehouse: Warehouse) => void;
  onDelete: (warehouse: Warehouse) => void;
  onConsult: (warehouse: Warehouse) => void;
  fontSize?: '40' | '50' | '60' | '70' | '80' | '90' | '100';
}

const WarehouseTable: React.FC<WarehouseTableProps> = ({ warehouses, onCreate, onEdit, onDelete, onConsult, fontSize = '80' }) => {
  // Système de zoom contrôlé par prop
  const zoomLevels: Record<string, number> = {
    '40': 0.75,
    '50': 0.80,
    '60': 0.85,
    '70': 0.90,
    '80': 0.95,
    '90': 1.0,
    '100': 1.05
  };
  const zoom = zoomLevels[fontSize];
  const fontSizeStyle = { fontSize: `${Math.round(14 * zoom)}px` };
  const rowHeight = `h-[${Math.round(40 * zoom)}px]`;
  // Le parent gère la recherche et le filtre, ici on affiche tout
  const filtered = warehouses;

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className={rowHeight} style={fontSizeStyle}>
            <TableHead className="w-[160px]" style={fontSizeStyle}>Nom</TableHead>
            <TableHead className="w-[120px]" style={fontSizeStyle}>Société</TableHead>
            <TableHead className="w-[120px]" style={fontSizeStyle}>Téléphone</TableHead>
            <TableHead className="w-[180px]" style={fontSizeStyle}>Adresse</TableHead>
            <TableHead className="w-[80px]" style={fontSizeStyle}>Statut</TableHead>
            <TableHead className="w-[120px]" style={fontSizeStyle}>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filtered.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-muted-foreground text-center py-4">Aucun entrepôt trouvé.</TableCell>
            </TableRow>
          ) : (
            filtered.map(wh => (
              <TableRow key={wh.id} className={rowHeight} style={fontSizeStyle}>
                <TableCell className="font-medium cursor-pointer hover:underline" style={fontSizeStyle} onClick={() => onConsult(wh)}>
                  {wh.name}
                </TableCell>
                <TableCell style={fontSizeStyle}>{wh.companyName}</TableCell>
                <TableCell style={fontSizeStyle}>{wh.phone && wh.phone.length > 0 ? wh.phone[0] : '-'}</TableCell>
                <TableCell style={fontSizeStyle}>{wh.address}</TableCell>
                <TableCell style={fontSizeStyle}>
                  {wh.isActive ? (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-green-100 text-green-700 border border-green-300 shadow">Actif</span>
                  ) : (
                    <span className="inline-block px-2 py-0.5 rounded-full text-[10px] font-semibold bg-red-100 text-red-700 border border-red-300 shadow">Inactif</span>
                  )}
                </TableCell>
                <TableCell className="flex gap-2" style={fontSizeStyle}>
                  <Button size="sm" variant="outline" onClick={() => onConsult(wh)} title="Consulter"><Eye className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => onEdit(wh)} title="Modifier"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => onDelete(wh)} title="Supprimer"><Trash2 className="h-4 w-4" /></Button>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WarehouseTable;
