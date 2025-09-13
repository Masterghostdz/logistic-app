import { db } from './firebaseClient';
import { doc, updateDoc } from 'firebase/firestore';

export const setChauffeurOnlineStatus = async (chauffeurId: string, isOnline: boolean) => {
  if (!chauffeurId) return;
  const chauffeurRef = doc(db, 'chauffeurs', chauffeurId);
  await updateDoc(chauffeurRef, { isOnline });
};
