import { onSnapshot } from 'firebase/firestore';

// Ecoute temps réel des entrepôts
export const listenWarehouses = (callback) => {
  return onSnapshot(warehousesCollection, (snapshot) => {
    const warehouses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(warehouses);
  });
};
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const warehousesCollection = collection(db, 'warehouses');

export const getWarehouses = async () => {
  const snapshot = await getDocs(warehousesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addWarehouse = async (warehouse) => {
  return await addDoc(warehousesCollection, warehouse);
};

export const updateWarehouse = async (id, updates) => {
  const warehouseRef = doc(db, 'warehouses', id);
  return await updateDoc(warehouseRef, updates);
};

export const deleteWarehouse = async (id) => {
  const warehouseRef = doc(db, 'warehouses', id);
  return await deleteDoc(warehouseRef);
};
