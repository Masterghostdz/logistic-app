import { useEffect, useState } from 'react';
import { db } from './firebaseClient';
import { collection, getDocs } from 'firebase/firestore';

export function useFirestoreConnectionStatus() {
  const [status, setStatus] = useState<'connected' | 'disconnected' | 'connecting'>('connecting');

  useEffect(() => {
    let cancelled = false;
    async function checkConnection() {
      setStatus('connecting');
      try {
        // Test a real collection that exists and is readable
        await getDocs(collection(db, 'users'));
        if (!cancelled) setStatus('connected');
      } catch (e) {
        if (!cancelled) setStatus('disconnected');
      }
    }
    checkConnection();
    return () => { cancelled = true; };
  }, []);

  return status;
}
