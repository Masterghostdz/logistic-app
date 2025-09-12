
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { Client } from '../types/client';


const clientsCollection = collection(db, 'clients');

export const getClients = async (): Promise<Client[]> => {
  const snapshot = await getDocs(clientsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
};

export const listenClients = (callback: (clients: Client[]) => void) => {
  return onSnapshot(clientsCollection, (snapshot) => {
    const clients = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Client[];
    callback(clients);
  });
};

export const addClient = async (client: Omit<Client, 'id'>, currentUser: { id: string, fullName?: string, username?: string }) => {
  // Debug: log user object
  if (typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log('addClient - currentUser:', currentUser);
  }
  const userName = currentUser?.fullName && currentUser.fullName.trim() !== ''
    ? currentUser.fullName
    : (currentUser?.username || '');
  const traceEntry = {
    userId: currentUser?.id || '',
    userName,
    action: 'creation',
    date: new Date().toISOString(),
  };
  const docRef = await addDoc(clientsCollection, {
    ...client,
    mobile: client.mobile || '',
    adresse: client.adresse || '',
    createur: userName, // nom affiché
    createurId: currentUser?.id || '',
    traceability: [traceEntry],
  });
  return docRef.id;
};

export const updateClient = async (id: string, updates: Partial<Client>, currentUser: { id: string, fullName?: string, username?: string }) => {
  const clientRef = doc(db, 'clients', id);
  // Fetch current traceability and creator fields
  let prevTrace: any[] = [];
  let prevCreateur = '';
  let prevCreateurId = '';
  try {
    const snap = await (await import('firebase/firestore')).getDoc(clientRef);
    if (snap.exists()) {
      const data = snap.data();
      if (Array.isArray(data.traceability)) prevTrace = data.traceability;
      if (typeof data.createur === 'string') prevCreateur = data.createur;
      if (typeof data.createurId === 'string') prevCreateurId = data.createurId;
    }
  } catch {}
  const traceEntry = {
    userId: currentUser?.id || '',
    userName: currentUser?.fullName || currentUser?.username || '',
    action: 'modification',
    date: new Date().toISOString(),
  };
  await updateDoc(clientRef, {
    ...updates,
    ...(updates.mobile !== undefined ? { mobile: updates.mobile } : {}),
    ...(updates.adresse !== undefined ? { adresse: updates.adresse } : {}),
    createur: prevCreateur,
    createurId: prevCreateurId,
    traceability: [...prevTrace, traceEntry],
  });
};

export const deleteClient = async (id: string) => {
  const clientRef = doc(db, 'clients', id);
  return await deleteDoc(clientRef);
};
