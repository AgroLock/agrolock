import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { connectFreighter, currentFreighterAddress } from '../lib/freighter';
import { api, setToken } from '../lib/api';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const establishSession = useCallback(async (addr) => {
    const { token } = await api.connect(addr);
    setToken(token);
    setAddress(addr);
  }, []);

  useEffect(() => {
    currentFreighterAddress()
      .then((addr) => (addr ? establishSession(addr) : null))
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [establishSession]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectFreighter();
      await establishSession(addr);
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }, [establishSession]);

  const disconnect = useCallback(() => {
    setToken(null);
    setAddress(null);
  }, []);

  return (
    <WalletContext.Provider value={{ address, connect, disconnect, connecting, error, checkingSession }}>
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
