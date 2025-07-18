import { onSnapshot } from 'firebase/firestore';

// Ecoute temps réel des types de véhicules
export const listenVehicleTypes = (callback) => {
  return onSnapshot(vehicleTypesCollection, (snapshot) => {
    const types = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    callback(types);
  });
};
import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';

const vehicleTypesCollection = collection(db, 'vehicleTypes');

export const getVehicleTypes = async () => {
  const snapshot = await getDocs(vehicleTypesCollection);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const addVehicleType = async (vehicleType) => {
  return await addDoc(vehicleTypesCollection, vehicleType);
};

export const updateVehicleType = async (id, updates) => {
  const vehicleTypeRef = doc(db, 'vehicleTypes', id);
  return await updateDoc(vehicleTypeRef, updates);
};

export const deleteVehicleType = async (id) => {
  const vehicleTypeRef = doc(db, 'vehicleTypes', id);
  return await deleteDoc(vehicleTypeRef);
};
