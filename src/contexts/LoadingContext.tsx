import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LoadingContextType {
  show: (message?: string) => void;
  hide: () => void;
  isLoading: boolean;
  message?: string | null;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const useLoading = () => {
  const ctx = useContext(LoadingContext);
  if (!ctx) throw new Error('useLoading must be used within LoadingProvider');
  return ctx;
};

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [count, setCount] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  const show = (msg?: string) => {
    setMessage(msg || null);
    setCount(c => c + 1);
  };

  const hide = () => {
    setCount(c => Math.max(0, c - 1));
    if (count <= 1) setMessage(null);
  };

  return (
    <LoadingContext.Provider value={{ show, hide, isLoading: count > 0, message }}>{children}</LoadingContext.Provider>
  );
};

export default LoadingContext;
