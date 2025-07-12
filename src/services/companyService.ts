import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const companiesCollection = collection(db, 'companies');

export const getCompanies = async () => {
  const snapshot = await getDocs(companiesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addCompany = async (company) => {
  return await addDoc(companiesCollection, company);
};

export const updateCompany = async (id, updates) => {
  const companyRef = doc(db, 'companies', id);
  return await updateDoc(companyRef, updates);
};

export const deleteCompany = async (id) => {
  const companyRef = doc(db, 'companies', id);
  return await deleteDoc(companyRef);
};
