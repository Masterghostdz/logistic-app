import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot, setDoc, DocumentReference, DocumentData, getDoc } from 'firebase/firestore';
import { User } from '../types';

const paymentsCollection = collection(db, 'payments');

export const listenPayments = (callback: (payments: any[]) => void) => {
  const unsubscribe = onSnapshot(paymentsCollection, (snapshot) => {
    const payments = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    callback(payments);
  });
  return unsubscribe;
};

export const getPayments = async () => {
  const snapshot = await getDocs(paymentsCollection);
  return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const filterPaymentsForUser = (payments: any[], user: User | null) => {
  if (!Array.isArray(payments)) return [];
  if (!user) return [];
  // admins see everything
  if (user.role === 'admin') return payments;
  // caissier internal sees everything
  if (user.role === 'caissier' && user.employeeType === 'interne') return payments;
  // external users (caissier or chauffeur) see only payments for their company
  if ((user.role === 'caissier' || user.role === 'chauffeur') && user.employeeType === 'externe') {
    if (!user.companyId) return [];
    return (payments || []).filter(p => String(p.companyId || '') === String(user.companyId));
  }
  // default: return payments (conservative fallback)
  return payments;
};

export const addPayment = async (payment: any): Promise<DocumentReference<DocumentData>> => {
  // If caller provided an id, use that id as the Firestore doc id to keep it predictable
  if (payment && payment.id) {
    const ref = doc(db, 'payments', payment.id);
    await setDoc(ref, payment);
    return ref as DocumentReference<DocumentData>;
  }
  return await addDoc(paymentsCollection, payment);
};

export const updatePayment = async (id: string, updates: any) => {
  const ref = doc(db, 'payments', id);
  return await updateDoc(ref, updates);
};

export const deletePayment = async (id: string) => {
  const ref = doc(db, 'payments', id);
  return await deleteDoc(ref);
};

// Safe delete: enforce business rules client-side before attempting deletion.
// Rules:
// - If payment.status is validated/validee -> refuse deletion
// - Only users with role 'caissier' or 'chauffeur' may delete receipts. Planners cannot.
// - If user is 'chauffeur', allow deletion only when they are the creator (createdBy) or the chauffeurId on the payment.
export const safeDeletePayment = async (id: string, user: any) => {
  const ref = doc(db, 'payments', id);
  const snap = await getDoc(ref);
  if (!snap.exists()) {
    throw new Error('Payment not found');
  }
  const data: any = snap.data();
  const status = String(data.status || '').toLowerCase();
  if (['validee', 'validated', 'valide', 'valid'].includes(status)) {
    throw new Error('Cannot delete a validated payment');
  }
  const role = user?.role;
  if (!role) throw new Error('Unauthorized');
  if (role === 'planificateur') {
    throw new Error('Planificateur cannot delete payment receipts');
  }
  if (role === 'caissier') {
    return await deleteDoc(ref);
  }
  if (role === 'chauffeur') {
    const allowed = (data.createdBy && data.createdBy === user.id) || (data.chauffeurId && data.chauffeurId === user.id);
    if (!allowed) throw new Error('Chauffeur can only delete their own receipts');
    return await deleteDoc(ref);
  }
  // default deny
  throw new Error('Unauthorized role');
};

export default {
  listenPayments,
  getPayments,
  addPayment,
  updatePayment,
  deletePayment
  , filterPaymentsForUser
};
