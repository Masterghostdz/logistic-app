import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const financialRecordsCollection = collection(db, 'financialRecords');

export const getFinancialRecords = async () => {
  const snapshot = await getDocs(financialRecordsCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addFinancialRecord = async (record) => {
  return await addDoc(financialRecordsCollection, record);
};

export const updateFinancialRecord = async (id, updates) => {
  const recordRef = doc(db, 'financialRecords', id);
  return await updateDoc(recordRef, updates);
};

export const deleteFinancialRecord = async (id) => {
  const recordRef = doc(db, 'financialRecords', id);
  return await deleteDoc(recordRef);
};
