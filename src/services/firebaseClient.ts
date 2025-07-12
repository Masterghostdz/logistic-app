// src/services/firebaseClient.ts
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

// Remplace par ta configuration Firebase
const firebaseConfig = {
  apiKey: 'AIzaSyDTjpwlVJoaliTt16ltIJjqVf2Rn6DG-Ck',
  authDomain: 'logigrine-space-clound.firebaseapp.com',
  projectId: 'logigrine-space-clound',
  storageBucket: 'logigrine-space-clound.firebasestorage.app',
  messagingSenderId: '663767006597',
  appId: '1:663767006597:web:5e82dd4d2e617c49ad18ec',
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
