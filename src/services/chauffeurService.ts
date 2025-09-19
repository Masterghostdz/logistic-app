import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

// Met à jour la position et l'état de tracking d'un chauffeur
export const updateChauffeurPosition = async (id: string, latitude: number, longitude: number, isTracking: boolean) => {
  const chauffeurRef = doc(db, 'chauffeurs', id);
  return await updateDoc(chauffeurRef, {
    latitude,
    longitude,
    isTracking,
    lastPosition: {
      lat: latitude,
      lng: longitude,
      at: new Date().toISOString(),
    },
  });
};

const chauffeursCollection = collection(db, 'chauffeurs');

// Synchronisation temps réel de la collection 'chauffeurs'
export const listenChauffeurs = (callback: (chauffeurs: any[]) => void) => {
  const unsubscribe = onSnapshot(chauffeursCollection, (snapshot) => {
    const chauffeurs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(chauffeurs);
  });
  return unsubscribe;
};

export const getChauffeurs = async () => {
  const snapshot = await getDocs(chauffeursCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addChauffeur = async (chauffeur) => {
  return await addDoc(chauffeursCollection, chauffeur);
};

export const updateChauffeur = async (id, updates) => {
  // Si le chauffeur est offline, forcer gpsActive à false
  if (updates.isActive === false) {
    updates.gpsActive = false;
  }
  // Filtrer les champs undefined
  const filteredUpdates = Object.fromEntries(Object.entries(updates).filter(([_, v]) => v !== undefined));
  // Met à jour la collection users (Admin)
  const userRef = doc(db, 'users', id);
  // Met à jour la collection chauffeurs (Firebase)
  const chauffeurRef = doc(db, 'chauffeurs', id);
  try {
    await updateDoc(userRef, filteredUpdates);
  } catch (e) {
    console.error('Erreur Firestore utilisateur:', e);
  }
  try {
    await updateDoc(chauffeurRef, filteredUpdates);
  } catch (e) {
    console.error('Erreur Firestore chauffeur:', e);
  }
};

export const deleteChauffeur = async (id) => {
  const chauffeurRef = doc(db, 'chauffeurs', id);
  const userRef = doc(db, 'users', id);
  try {
    await deleteDoc(chauffeurRef);
  } catch (e) {}
  try {
    await deleteDoc(userRef);
  } catch (e) {}
};
