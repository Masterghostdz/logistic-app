
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Declaration } from '../types';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';

interface EditDeclarationDialogProps {
  declaration: Declaration | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (declaration: Declaration) => void;
}

const EditDeclarationDialog: React.FC<EditDeclarationDialogProps> = ({
  declaration,
  isOpen,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState({
    distance: '',
    deliveryFees: '',
    notes: '',
    number: ''
  });

  useEffect(() => {
    if (declaration) {
      setFormData({
        distance: declaration.distance?.toString() || '',
        deliveryFees: declaration.deliveryFees?.toString() || '',
        notes: declaration.notes || '',
        number: declaration.number || ''
      });
    }
  }, [declaration]);

  const handleSave = () => {
    if (!declaration) return;

    const updatedDeclaration: Declaration = {
      ...declaration,
      distance: formData.distance ? parseInt(formData.distance) : undefined,
      deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
      notes: formData.notes,
      number: formData.number
    };

    onSave(updatedDeclaration);
  };

  const handleNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, number }));
  };

  const handleComponentsChange = (year: string, month: string, programNumber: string) => {
    // Update the declaration parts if needed
  };

  if (!declaration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Modifier la déclaration</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SimpleDeclarationNumberForm
            onNumberChange={handleNumberChange}
            onComponentsChange={handleComponentsChange}
            initialYear={declaration.year}
            initialMonth={declaration.month}
            initialProgramNumber={declaration.programNumber}
          />
          
          <div>
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="deliveryFees">Frais de livraison (DZD)</Label>
            <Input
              id="deliveryFees"
              type="number"
              value={formData.deliveryFees}
              onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
            />
          </div>
          
          <div className="flex gap-2 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Sauvegarder
            </Button>
            <Button variant="outline" onClick={onClose}>
              Annuler
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeclarationDialog;
