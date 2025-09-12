import React, { useState, useEffect } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { reverseGeocode } from '../../utils/reverseGeocode';
import { createPortal } from 'react-dom';
import CameraPreviewModal from '../CameraPreviewModal';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { toast } from 'sonner';
import { Client } from '../../types/client';
import PositionPickerModal from './PositionPickerModal';

interface ClientDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (client: Partial<Client>, isEdit: boolean) => void;
  editingClient: Client | null;
  readOnly?: boolean;
}

const emptyClient = {
  name: '',
  mobile: '',
  photoUrl: '',
  coordinates: { lat: '', lng: '' },
};

const ClientDialog = ({ isOpen, onClose, onSubmit, editingClient, readOnly = false }: ClientDialogProps) => {
  const { t } = useTranslation();
  const [client, setClient] = useState<any>(emptyClient);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showPositionModal, setShowPositionModal] = useState(false);

  useEffect(() => {
    if (editingClient) {
      setClient({
        ...editingClient,
        coordinates: {
          lat: editingClient.coordinates.lat,
          lng: editingClient.coordinates.lng,
        },
      });
    } else {
      setClient(emptyClient);
    }
  }, [editingClient, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'lat' || name === 'lng') {
      setClient((prev: any) => ({
        ...prev,
        coordinates: { ...prev.coordinates, [name]: value },
      }));
    } else {
      setClient((prev: any) => ({ ...prev, [name]: value }));
    }
  };

  // Import d'image depuis la galerie
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploading(true);
      const file = e.target.files[0];
      try {
        const [photoUrl] = await import('../../services/declarationService').then(s => s.uploadDeclarationPhotos([file]));
        setClient((prev: any) => ({ ...prev, photoUrl }));
      } catch {
        toast.error('Erreur lors de l\'upload de la photo');
      }
      setUploading(false);
    }
  };

  // Prise de photo via CameraPreviewModal
  const handlePhotoTaken = async (dataUrl: string) => {
    setIsCameraOpen(false);
    setUploading(true);
    try {
      // Convertir le dataUrl en File
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      const file = new File([blob], `photo_${Date.now()}.jpeg`, { type: blob.type });
      const [photoUrl] = await import('../../services/declarationService').then(s => s.uploadDeclarationPhotos([file]));
      setClient((prev: any) => ({ ...prev, photoUrl }));
    } catch {
      toast.error('Erreur lors de l\'upload de la photo');
    }
    setUploading(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!client.name || client.coordinates.lat === '' || client.coordinates.lng === '') {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    onSubmit(
      {
        ...client,
        coordinates: {
          lat: parseFloat(client.coordinates.lat),
          lng: parseFloat(client.coordinates.lng),
        },
      },
      !!editingClient
    );
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onOpenChange={open => {
          // Ne pas fermer le dialog si la caméra est ouverte
          if (!open && !isCameraOpen) onClose();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Modifier le client' : 'Ajouter un client'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="clientName">{t('forms.name') || 'Nom'} *</Label>
              <Input
                  id="clientName"
                  name="name"
                  value={client.name}
                  onChange={handleChange}
                  required
                  readOnly={readOnly}
                  disabled={readOnly}
                />
            </div>
            <div>
              <Label htmlFor="clientMobile">{t('forms.mobile') || 'Mobile'}</Label>
              <Input
                  id="clientMobile"
                  name="mobile"
                  type="tel"
                  value={client.mobile}
                  onChange={handleChange}
                  placeholder={t('forms.phonePlaceholder') || 'Numéro de téléphone'}
                  pattern="[0-9+ ]*"
                  maxLength={20}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
            </div>
            <div>
              <Label>{t('forms.photo') || 'Photo'}</Label>
              <div className="flex items-center gap-3">
                {client.photoUrl ? (
                  <div className="relative">
                    <img src={client.photoUrl} alt="client" className="w-16 h-16 rounded object-cover border" />
                  </div>
                ) : (
                  !readOnly && <>
                    <button
                      type="button"
                      className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded text-2xl text-green-600 bg-muted hover:bg-accent transition"
                      title="Prendre une photo"
                      onClick={() => setIsCameraOpen(true)}
                      disabled={uploading}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <circle cx="12" cy="13.5" r="3.5" stroke="currentColor" strokeWidth="2" fill="none"/>
                        <rect x="8" y="3" width="8" height="4" rx="1" stroke="currentColor" strokeWidth="2" fill="none"/>
                      </svg>
                    </button>
                    <label className="w-16 h-16 flex items-center justify-center border-2 border-dashed rounded cursor-pointer text-2xl text-muted-foreground bg-muted hover:bg-accent transition ml-2" title="Importer une photo">
                      +
                      <Input type="file" accept="image/*" className="hidden" onChange={handleFileChange} disabled={uploading} />
                    </label>
                  </>
                )}
                {uploading && <span className="text-xs text-muted-foreground ml-2">Envoi...</span>}
              </div>
            </div>
            <div>
              <Label>{t('forms.geolocation') || 'Position géographique'}</Label>
              <div className="flex gap-2 items-center">
                {!readOnly && (
                  <Button type="button" variant="outline" onClick={() => setShowPositionModal(true)} title="Choisir sur la carte">
                    <span className="material-icons text-lg align-middle">gps_fixed</span>
                    {client.coordinates.lat && client.coordinates.lng ? (
                      <span className="ml-2 text-green-600 text-xs font-semibold">Position marquée</span>
                    ) : (
                      <span className="ml-2 text-muted-foreground text-xs">Aucune position</span>
                    )}
                  </Button>
                )}
              </div>
            </div>
            <PositionPickerModal
              isOpen={showPositionModal}
              onClose={() => setShowPositionModal(false)}
              onConfirm={async coords => {
                setClient((prev: any) => ({ ...prev, coordinates: { lat: coords.lat, lng: coords.lng } }));
                // Reverse geocoding pour remplir l'adresse automatiquement
                const address = await reverseGeocode(coords.lat, coords.lng);
                setClient((prev: any) => ({ ...prev, adresse: address }));
                setShowPositionModal(false);
              }}
              initialPosition={
                client.coordinates.lat && client.coordinates.lng
                  ? { lat: parseFloat(client.coordinates.lat), lng: parseFloat(client.coordinates.lng) }
                  : undefined
              }
            />
            <div>
              <Label htmlFor="adresse">{t('forms.address') || 'Adresse'}</Label>
              <Textarea
                  id="adresse"
                  name="adresse"
                  placeholder={t('forms.addressPlaceholder') || 'Adresse du client'}
                  value={client.adresse || ''}
                  onChange={handleChange}
                  className="mt-1"
                  rows={2}
                  readOnly={readOnly}
                  disabled={readOnly}
                />
            </div>
            {readOnly && client.traceability && Array.isArray(client.traceability) && client.traceability.length > 0 && (
              <div className="flex flex-col gap-2 mt-4 text-xs text-muted-foreground">
                {/* Historique/traçabilité si disponible */}
                <div className="mt-6 border-t pt-4">
                  <div className="font-semibold text-sm mb-2 text-muted-foreground">{t('traceability.clientHistory') || 'Historique du client'}</div>
                  <div className="space-y-2 text-xs">
                    {client.traceability.map((trace: any, idx: number) => (
                      <div key={idx} className="text-muted-foreground">
                        <span className="font-semibold">{trace.userName || trace.userId || t('traceability.unknownUser') || 'Utilisateur inconnu'}</span>
                        <span className="mx-2 text-[10px]">
                          ({trace.date ? new Date(trace.date).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : ''}
                          {trace.date ? ' ' + new Date(trace.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }) : ''})
                        </span>
                        : {(() => {
                            switch(trace.action) {
                              case 'creation':
                                return t('traceability.clientCreated') || 'Client créé';
                              case 'modification':
                                return t('traceability.clientModified') || 'Client modifié';
                              case 'validation':
                                return t('traceability.clientValidated') || 'Client validé';
                              case 'rejet':
                                return t('traceability.clientRejected') || 'Client rejeté';
                              case 'archivage':
                                return t('traceability.clientArchived') || 'Client archivé';
                              default:
                                return trace.action;
                            }
                          })()}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            {!readOnly && (
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">{editingClient ? 'Enregistrer' : 'Créer'}</Button>
                <Button type="button" variant="outline" onClick={onClose}>Annuler</Button>
              </div>
            )}
          </form>
        </DialogContent>
      </Dialog>
      {/* Modal appareil photo plein écran, monté hors Dialog */}
      {typeof window !== 'undefined' && createPortal(
        <CameraPreviewModal isOpen={isCameraOpen} onPhotoTaken={handlePhotoTaken} onClose={() => setIsCameraOpen(false)} />,
        document.body
      )}
    </>
  );
};

export default ClientDialog;
