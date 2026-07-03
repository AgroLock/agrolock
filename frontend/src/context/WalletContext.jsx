import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { StrKey } from '@stellar/stellar-sdk';
import { connectFreighter, currentFreighterAddress } from '../lib/freighter';
import { api, setToken, setAuthMeta, getAuthMeta } from '../lib/api';

const WalletContext = createContext(null);

export function WalletProvider({ children }) {
  const [address, setAddress] = useState(null);
  // 'freighter' can sign transactions; 'address' is read-only (pasted public key).
  const [authMethod, setAuthMethod] = useState(null);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState(null);
  const [checkingSession, setCheckingSession] = useState(true);

  const establishSession = useCallback(async (addr, method) => {
    const { token } = await api.connect(addr);
    setToken(token);
    setAuthMeta(addr, method);
    setAddress(addr);
    setAuthMethod(method);
  }, []);

  useEffect(() => {
    currentFreighterAddress()
      .then(async (addr) => {
        if (addr) {
          await establishSession(addr, 'freighter');
          return;
        }
        const saved = getAuthMeta();
        if (saved.address && saved.method === 'address') {
          await establishSession(saved.address, 'address');
        }
      })
      .catch(() => {})
      .finally(() => setCheckingSession(false));
  }, [establishSession]);

  const connect = useCallback(async () => {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectFreighter();
      await establishSession(addr, 'freighter');
    } catch (err) {
      setError(err.message);
    } finally {
      setConnecting(false);
    }
  }, [establishSession]);

  const connectWithAddress = useCallback(
    async (addr) => {
      setConnecting(true);
      setError(null);
      try {
        if (!StrKey.isValidEd25519PublicKey(addr)) {
          throw new Error("That doesn't look like a valid Stellar address (should start with G, 56 characters).");
        }
        await establishSession(addr, 'address');
      } catch (err) {
        setError(err.message);
      } finally {
        setConnecting(false);
      }
    },
    [establishSession]
  );

  const disconnect = useCallback(() => {
    setToken(null);
    setAuthMeta(null, null);
    setAddress(null);
    setAuthMethod(null);
  }, []);

  return (
    <WalletContext.Provider
      value={{
        address,
        authMethod,
        canSign: authMethod === 'freighter',
        connect,
        connectWithAddress,
        disconnect,
        connecting,
        error,
        checkingSession,
      }}
    >
      {children}
    </WalletContext.Provider>
  );
}

export function useWallet() {
  const ctx = useContext(WalletContext);
  if (!ctx) throw new Error('useWallet must be used within WalletProvider');
  return ctx;
}
