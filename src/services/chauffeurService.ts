import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const chauffeursCollection = collection(db, 'chauffeurs');

export const getChauffeurs = async () => {
  const snapshot = await getDocs(chauffeursCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addChauffeur = async (chauffeur) => {
  return await addDoc(chauffeursCollection, chauffeur);
};

export const updateChauffeur = async (id, updates) => {
  const chauffeurRef = doc(db, 'chauffeurs', id);
  return await updateDoc(chauffeurRef, updates);
};

export const deleteChauffeur = async (id) => {
  const chauffeurRef = doc(db, 'chauffeurs', id);
  return await deleteDoc(chauffeurRef);
};
