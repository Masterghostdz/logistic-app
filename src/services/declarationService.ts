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


// Update declaration with optional traceability entry and primeDeRoute calculation
export const updateDeclaration = async (id, updates, traceEntry = null) => {
  const declarationRef = doc(db, 'declarations', id);
  let toUpdate = { ...updates };
  if (traceEntry) {
    toUpdate.traceability = [...(updates.traceability || []), traceEntry];
  }
  // Prime de route: calcul automatique si statut passe à 'valide' et chauffeur interne
  if (toUpdate.status === 'valide') {
    // Charger la déclaration existante pour récupérer chauffeurId et distance
    const { getDoc } = await import('firebase/firestore');
    const declarationSnap = await getDoc(declarationRef);
    const declarationData = declarationSnap.data();
    const chauffeurId = declarationData?.chauffeurId || toUpdate.chauffeurId;
    const distance = toUpdate.distance ?? declarationData?.distance;
    // Charger le chauffeur pour vérifier le type (interne/externe) et le type de véhicule
    const chauffeurRef = doc(db, 'chauffeurs', chauffeurId);
    const chauffeurSnap = await getDoc(chauffeurRef);
    const chauffeurData = chauffeurSnap.data();
    if (chauffeurData?.employeeType === 'interne') {
      const vehicleTypeId = chauffeurData.vehicleType;
      if (vehicleTypeId && distance) {
        // Charger le type de véhicule pour récupérer primeKilometrique
        const vehicleTypeRef = doc(db, 'vehicleTypes', vehicleTypeId);
        const vehicleTypeSnap = await getDoc(vehicleTypeRef);
        const vehicleTypeData = vehicleTypeSnap.data();
        const primeKilometrique = vehicleTypeData?.primeKilometrique;
        if (typeof primeKilometrique === 'number') {
          toUpdate.primeDeRoute = distance * primeKilometrique;
        }
      }
    }
  }
  return await updateDoc(declarationRef, toUpdate);
};

export const deleteDeclaration = async (id) => {
  const declarationRef = doc(db, 'declarations', id);
  return await deleteDoc(declarationRef);
};
