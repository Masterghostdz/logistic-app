import { DeclarationTrace } from './index';

export interface Client {
  id: string;
  name: string;
  mobile?: string;
  photoUrl: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  adresse?: string;
  createur?: string; // nom affiché
  createurId?: string; // id utilisateur
  createdAt: string;
  status?: 'pending' | 'validated' | 'modifie' | 'rejected' | 'archived'; // 'pending' = créé, 'validated' = accepté, 'modifie' = modifié, 'rejected' = rejeté, 'archived' = archivé
  traceability?: DeclarationTrace[];
}
