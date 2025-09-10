import React, { useState, useEffect } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';  
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Declaration } from '../types';
import { getAllRefusalReasons } from '../services/refusalReasonService';
import SimpleDeclarationNumberForm from './SimpleDeclarationNumberForm';
import { Badge } from './ui/badge';

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
  const { t } = useTranslation();

  // Affichage du motif de refus (hook unique, bien placé)
  const [refusalReasonLabel, setRefusalReasonLabel] = useState<string | null>(null);
  useEffect(() => {
    if (declaration && declaration.status === 'refuse' && declaration.refusalReason) {
      getAllRefusalReasons().then((reasons) => {
        const found = reasons.find(r => r.id === declaration.refusalReason);
        if (found) {
          setRefusalReasonLabel(found[t('settings.language') || 'fr'] || found['fr']);
        } else {
          setRefusalReasonLabel(null);
        }
      });
    } else {
      setRefusalReasonLabel(null);
    }
  }, [declaration, t]);


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

  // Copie de la logique getStatusBadge pour cohérence avec le tableau
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'en_route':
        return <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">{t('dashboard.onRoad')}</Badge>;
      case 'en_panne':
        return <Badge className="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">{t('declarations.breakdown')}</Badge>;
      case 'en_cours':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">{t('dashboard.pending')}</Badge>;
      case 'valide':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">{t('dashboard.validated')}</Badge>;
      case 'refuse':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">{t('dashboard.refused')}</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
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
          {/* Affichage de l'état de la déclaration en badge, et motif à côté si refus */}
          {readOnly && (
            <div className="flex items-center gap-3 mb-2">
              {getStatusBadge(declaration.status)}
              {declaration.status === 'refuse' && refusalReasonLabel && (
                <span className="text-base font-semibold text-red-700 dark:text-red-400">{refusalReasonLabel}</span>
              )}
            </div>
          )}
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
          {/* Affichage toujours la section des reçus de paiement (photos), même si vide */}
          <div className="flex flex-col gap-2">
            <Label className="text-foreground text-sm font-medium mb-1">{t('declarations.paymentReceipts') || 'Reçus de paiement (photos)'}</Label>
            <div className="flex gap-2 flex-wrap items-center min-h-[2.5rem]">
              {declaration?.paymentReceipts && declaration.paymentReceipts.length > 0 ? (
                declaration.paymentReceipts.map((fileName, idx) => (
                  <div key={idx} className="relative w-16 h-16 border rounded overflow-hidden bg-muted">
                    {/* Remplacer l'URL par la logique réelle si besoin */}
                    <img
                      src={typeof fileName === 'string' ? fileName : ''}
                      alt={`reçu-${idx}`}
                      className="object-cover w-full h-full"
                      onError={e => (e.currentTarget.style.display = 'none')}
                    />
                  </div>
                ))
              ) : (
                <span className="text-muted-foreground text-xs italic">{t('declarations.noPaymentReceipts') || 'Aucun reçu de paiement'}</span>
              )}
            </div>
          </div>
          {/* Section traçabilité (historique) */}
          {declaration?.traceability && declaration.traceability.length > 0 && (
            <div className="mt-6 border-t pt-4">
              <div className="font-semibold text-sm mb-2 text-muted-foreground">Historique de la déclaration</div>
              <div className="space-y-2 text-xs">
                {declaration.traceability.map((trace, idx) => (
                  <div key={idx} className="text-muted-foreground">
                    <span className="font-semibold">{trace.userName}</span>
                    <span className="mx-2 text-[10px]">({new Date(trace.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' })} {new Date(trace.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })})</span>
                    : {trace.action}
                  </div>
                ))}
              </div>
            </div>
          )}
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
