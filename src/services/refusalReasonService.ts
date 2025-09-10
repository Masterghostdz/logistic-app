// Service Firestore pour les motifs de refus multilingues
import { RefusalReason } from '../types/refusalReason';
import { getFirestore, collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const db = getFirestore();
const refusalReasonsCol = collection(db, 'refusalReasons');

export async function getAllRefusalReasons(): Promise<RefusalReason[]> {
  const snap = await getDocs(refusalReasonsCol);
  return snap.docs.map(d => ({ id: d.id, ...d.data() } as RefusalReason));
}

export async function addRefusalReason(reason: Omit<RefusalReason, 'id' | 'createdAt' | 'createdBy'>): Promise<string> {
  const auth = getAuth();
  const docRef = await addDoc(refusalReasonsCol, {
    ...reason,
    createdAt: Timestamp.now().toDate().toISOString(),
    createdBy: auth.currentUser?.uid || 'admin',
  });
  return docRef.id;
}

export async function updateRefusalReason(id: string, reason: Partial<RefusalReason>) {
  await updateDoc(doc(refusalReasonsCol, id), reason);
}

export async function deleteRefusalReason(id: string) {
  await deleteDoc(doc(refusalReasonsCol, id));
}
