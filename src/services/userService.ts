import { db } from './firebaseClient';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
// Synchronisation temps réel de la collection 'users'
export const listenUsers = (callback: (users: any[]) => void) => {
  const unsubscribe = onSnapshot(usersCollection, (snapshot) => {
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        username: data.username || '',
        role: data.role || 'chauffeur',
        firstName: data.firstName || '',
        lastName: data.lastName || '',
        fullName: data.fullName || '',
        phone: data.phone || [],
        email: data.email || '',
        createdAt: data.createdAt || '',
        isActive: data.isActive !== undefined ? data.isActive : true,
        avatar: data.avatar,
        vehicleType: data.vehicleType,
        employeeType: data.employeeType
      };
    });
    callback(users);
  });
  return unsubscribe;
};

const usersCollection = collection(db, 'users');

export const getUsers = async () => {
  const snapshot = await getDocs(usersCollection);
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      username: data.username || '',
      role: data.role || 'chauffeur',
      firstName: data.firstName || '',
      lastName: data.lastName || '',
      fullName: data.fullName || '',
      phone: data.phone || [],
      email: data.email || '',
      createdAt: data.createdAt || '',
      isActive: data.isActive !== undefined ? data.isActive : true,
      avatar: data.avatar,
      vehicleType: data.vehicleType,
      employeeType: data.employeeType
    };
  });
};

export const addUser = async (user) => {
  return await addDoc(usersCollection, user);
};

export const updateUser = async (id, updates) => {
  const userRef = doc(db, 'users', id);
  return await updateDoc(userRef, updates);
};

export const deleteUser = async (id) => {
  const userRef = doc(db, 'users', id);
  return await deleteDoc(userRef);
};
