
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
  onSave?: (declaration: Declaration) => void;
  readOnly?: boolean;
}

const EditDeclarationDialog: React.FC<EditDeclarationDialogProps> = ({
  declaration,
  isOpen,
  onClose,
  onSave,
  readOnly = false
}) => {
  const [formData, setFormData] = useState({
    distance: '',
    deliveryFees: '',
    notes: '',
    number: '',
    year: '',
    month: '',
    programNumber: ''
  });

  useEffect(() => {
    if (declaration) {
      setFormData({
        distance: declaration.distance?.toString() || '',
        deliveryFees: declaration.deliveryFees?.toString() || '',
        notes: declaration.notes || '',
        number: declaration.number || '',
        year: declaration.year || '',
        month: declaration.month || '',
        programNumber: declaration.programNumber || ''
      });
    }
  }, [declaration]);

  const handleSave = () => {
    if (!declaration) return;

    // Vérifier que le numéro de programme est complètement rempli (4 chiffres)
    if (!formData.programNumber || formData.programNumber.length !== 4) {
      alert('Le numéro de programme doit contenir 4 chiffres');
      return;
    }

    // Vérifier qu'au moins la distance ou les frais de livraison sont renseignés
    if (!formData.distance && !formData.deliveryFees) {
      alert('Veuillez renseigner soit la distance soit les frais de livraison');
      return;
    }

    const updatedDeclaration: Declaration = {
      ...declaration,
      distance: formData.distance ? parseInt(formData.distance) : undefined,
      deliveryFees: formData.deliveryFees ? parseInt(formData.deliveryFees) : undefined,
      notes: formData.notes,
      number: formData.number,
      year: formData.year,
      month: formData.month,
      programNumber: formData.programNumber
    };

    onSave(updatedDeclaration);
  };

  const handleNumberChange = (number: string) => {
    setFormData(prev => ({ ...prev, number }));
  };

  const handleComponentsChange = (year: string, month: string, programNumber: string) => {
    setFormData(prev => ({ 
      ...prev, 
      year, 
      month, 
      programNumber 
    }));
  };

  if (!declaration) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="max-w-md" aria-describedby="edit-declaration-description">
        <div id="edit-declaration-description" className="sr-only">
          Ce dialogue permet de modifier ou consulter une déclaration. Remplissez les champs requis puis validez.
        </div>
        <DialogHeader>
          <DialogTitle>{readOnly ? 'Consulter la déclaration' : 'Modifier la déclaration'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <SimpleDeclarationNumberForm
            onNumberChange={handleNumberChange}
            onComponentsChange={handleComponentsChange}
            initialYear={declaration.year}
            initialMonth={declaration.month}
            initialProgramNumber={declaration.programNumber}
            readOnly={readOnly}
          />
          <div>
            <Label htmlFor="distance">Distance (km)</Label>
            <Input
              id="distance"
              type="number"
              value={formData.distance}
              onChange={(e) => setFormData({ ...formData, distance: e.target.value })}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="deliveryFees">Frais de livraison (DZD)</Label>
            <Input
              id="deliveryFees"
              type="number"
              value={formData.deliveryFees}
              onChange={(e) => setFormData({ ...formData, deliveryFees: e.target.value })}
              disabled={readOnly}
            />
          </div>
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              disabled={readOnly}
            />
          </div>
          <div className="flex gap-2 pt-4">
            {!readOnly && (
              <Button onClick={handleSave} className="flex-1">
                Sauvegarder
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {readOnly ? 'Fermer' : 'Annuler'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditDeclarationDialog;
