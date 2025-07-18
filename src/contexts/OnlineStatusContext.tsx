import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { db } from '../services/firebaseClient';

interface OnlineStatusContextType {
  isOnline: boolean;
}

const OnlineStatusContext = createContext<OnlineStatusContextType>({ isOnline: true });

export const useOnlineStatus = () => useContext(OnlineStatusContext);

export const OnlineStatusProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    const checkConnection = async () => {
      try {
        await getDocs(collection(db, 'chauffeurs'));
        setIsOnline(true);
      } catch {
        setIsOnline(false);
      }
    };
    checkConnection();
    interval = setInterval(checkConnection, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <OnlineStatusContext.Provider value={{ isOnline }}>
      {children}
    </OnlineStatusContext.Provider>
  );
};
