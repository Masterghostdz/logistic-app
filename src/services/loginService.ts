import { db } from './firebaseClient';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { simpleHash } from '../utils/authUtils';

// Fonction de login Firestore (username/password)
export const loginWithUsername = async (username, password) => {
  if (!username || !password) return null;
  const usersCollection = collection(db, 'users');
  const q = query(usersCollection, where('username', '==', username), where('isActive', '==', true));
  const snapshot = await getDocs(q);
  if (snapshot.empty) {
    console.warn('Aucun utilisateur trouvé avec ce username');
    return null;
  }
  const userDoc = snapshot.docs[0];
  const userData = userDoc.data();
  if (!userData.salt || !userData.passwordHash) {
    console.error('Utilisateur mal configuré: salt ou passwordHash manquant');
    return null;
  }
  const inputPasswordHash = await simpleHash(password, userData.salt);
  if (inputPasswordHash === userData.passwordHash) {
    // Retourne tous les champs User attendus, avec fallback si absent
    return {
      id: userDoc.id,
      username: userData.username || '',
      role: userData.role || 'chauffeur',
      firstName: userData.firstName || '',
      lastName: userData.lastName || '',
      fullName: userData.fullName || '',
      phone: userData.phone || [],
      email: userData.email || '',
      createdAt: userData.createdAt || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      avatar: userData.avatar,
      vehicleType: userData.vehicleType,
      employeeType: userData.employeeType
        ,
        companyId: userData.companyId || undefined,
        companyName: userData.companyName || undefined
    };
  }
  return null;
};
