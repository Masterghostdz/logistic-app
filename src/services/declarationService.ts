// Helper to upload photos to Firebase Storage and return URLs
// Upload photos to local Express server and return URLs
export async function uploadDeclarationPhotos(files: File[]): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const formData = new FormData();
    formData.append('photo', file);
    const res = await fetch('http://localhost:3001/upload', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    // URL locale
    urls.push(`http://localhost:3001${data.url}`);
  }
  return urls;
}
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, DocumentReference, DocumentData } from 'firebase/firestore';

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


// Add declaration with optional traceability entry
export const addDeclaration = async (declaration, traceEntry = null): Promise<DocumentReference<DocumentData>> => {
  let toSave = { ...declaration };
  if (traceEntry) {
    toSave.traceability = [...(declaration.traceability || []), traceEntry];
  }
  return await addDoc(declarationsCollection, toSave);
};


// Update declaration with optional traceability entry
export const updateDeclaration = async (id, updates, traceEntry = null) => {
  const declarationRef = doc(db, 'declarations', id);
  let toUpdate = { ...updates };
  if (traceEntry) {
    toUpdate.traceability = [...(updates.traceability || []), traceEntry];
  }
  return await updateDoc(declarationRef, toUpdate);
};

export const deleteDeclaration = async (id) => {
  const declarationRef = doc(db, 'declarations', id);
  return await deleteDoc(declarationRef);
};
