
export const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

export interface SessionData {
  token: string;
  userId: string;
  expiresAt: number;
}

// Session token management
export const generateSecureToken = (): string => {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
};

export const getStoredSession = (): SessionData | null => {
  const sessionData = localStorage.getItem('logigrine_session');
  if (!sessionData) return null;
  
  try {
    const session: SessionData = JSON.parse(sessionData);
    return session.expiresAt > Date.now() ? session : null;
  } catch (error) {
    console.error('Error parsing session data:', error);
    localStorage.removeItem('logigrine_session');
    return null;
  }
};

export const storeSession = (sessionData: SessionData): void => {
  localStorage.setItem('logigrine_session', JSON.stringify(sessionData));
};

export const clearSession = (): void => {
  localStorage.removeItem('logigrine_session');
};
