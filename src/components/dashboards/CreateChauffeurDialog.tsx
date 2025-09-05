
import React from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Chauffeur } from '../../types';
import { useSharedData } from '../../contexts/SharedDataContext';
import PhoneNumbersField from '../PhoneNumbersField';

interface CreateChauffeurDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  editingChauffeur: Chauffeur | null;
  newChauffeur: {
    fullName: string;
    username: string;
    password: string;
    phone: string[];
    vehicleType: string;
    employeeType: 'interne' | 'externe';
  };
  setNewChauffeur: (chauffeur: any) => void;
}

const CreateChauffeurDialog = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editingChauffeur, 
  newChauffeur, 
  setNewChauffeur 
}: CreateChauffeurDialogProps) => {
  const { vehicleTypes } = useSharedData();

  const handleClose = () => {
    onClose();
    setNewChauffeur({
      fullName: '',
      username: '',
      password: '',
      phone: [''],
      vehicleType: '',
      employeeType: 'interne'
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {editingChauffeur ? 'Modifier le chauffeur' : 'Créer un nouveau chauffeur'}
          </DialogTitle>
          <DialogDescription>
            {editingChauffeur
              ? "Modifiez les informations du chauffeur sélectionné."
              : "Remplissez le formulaire pour créer un nouveau chauffeur."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <Label htmlFor="fullName">Nom complet *</Label>
            <Input
              id="fullName"
              value={newChauffeur.fullName}
              onChange={(e) => setNewChauffeur({ ...newChauffeur, fullName: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="username">Nom d'utilisateur *</Label>
            <Input
              id="username"
              value={newChauffeur.username}
              onChange={(e) => setNewChauffeur({ ...newChauffeur, username: e.target.value })}
              required
            />
          </div>
          <div>
            <Label htmlFor="password">Mot de passe *</Label>
            <Input
              id="password"
              type="password"
              value={newChauffeur.password}
              onChange={(e) => setNewChauffeur({ ...newChauffeur, password: e.target.value })}
              required
            />
          </div>
          <div>
            <PhoneNumbersField
              phones={newChauffeur.phone}
              onChange={(phones) => setNewChauffeur({ ...newChauffeur, phone: phones })}
            />
          </div>
          <div>
            <Label htmlFor="vehicleType">Type de véhicule</Label>
            <Select value={newChauffeur.vehicleType} onValueChange={(value) => setNewChauffeur({ ...newChauffeur, vehicleType: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Sélectionner un type" />
              </SelectTrigger>
              <SelectContent>
                {vehicleTypes.map((type) => (
                  <SelectItem key={type.id} value={type.name}>{type.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="employeeType">Type d'employé</Label>
            <Select value={newChauffeur.employeeType} onValueChange={(value: 'interne' | 'externe') => setNewChauffeur({ ...newChauffeur, employeeType: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="interne">Interne</SelectItem>
                <SelectItem value="externe">Externe</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex gap-2 pt-4">
            <Button type="submit" className="flex-1">
              {editingChauffeur ? 'Modifier' : 'Créer'}
            </Button>
            <Button type="button" variant="outline" onClick={handleClose}>
              Annuler
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateChauffeurDialog;
