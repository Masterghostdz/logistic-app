import { db } from './firebaseClient';
import { collection, addDoc, getDocs, query, where, updateDoc, doc } from 'firebase/firestore';

const notificationsCollection = collection(db, 'notifications');

export const addNotification = async (notification) => {
  // Vérifier s'il existe déjà une notification pour cette déclaration et ce statut
  if (!notification.declarationId) throw new Error('declarationId is required in notification');
  const q = query(
    notificationsCollection,
    where('chauffeurId', '==', notification.chauffeurId),
    where('declarationId', '==', notification.declarationId),
    where('message', '==', notification.message)
  );
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    return await addDoc(notificationsCollection, notification);
  } else {
    // Notification déjà existante, ne pas créer de doublon
    return null;
  }
};

export const getNotificationsForChauffeur = async (chauffeurId) => {
  const q = query(notificationsCollection, where('chauffeurId', '==', chauffeurId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const markNotificationAsRead = async (notificationId) => {
  const notifRef = doc(db, 'notifications', notificationId);
  await updateDoc(notifRef, { read: true });
};
