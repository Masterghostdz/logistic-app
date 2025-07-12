import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';

const declarationsCollection = collection(db, 'declarations');

// Synchronisation temps réel de la collection 'declarations'
export const listenDeclarations = (callback: (declarations: any[]) => void) => {
  const unsubscribe = onSnapshot(declarationsCollection, (snapshot) => {
    const declarations = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data
      };
    });
    callback(declarations);
  });
  return unsubscribe;
};

export const getDeclarations = async () => {
  const snapshot = await getDocs(declarationsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addDeclaration = async (declaration) => {
  return await addDoc(declarationsCollection, declaration);
};

export const updateDeclaration = async (id, updates) => {
  const declarationRef = doc(db, 'declarations', id);
  return await updateDoc(declarationRef, updates);
};

export const deleteDeclaration = async (id) => {
  const declarationRef = doc(db, 'declarations', id);
  return await deleteDoc(declarationRef);
};
