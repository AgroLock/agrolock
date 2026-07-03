import { useEffect, useState } from 'react';

// Polls Stellar Horizon's public testnet root for the latest closed ledger
// number — genuine live network data (not a fake animated counter) to back
// up the "live" claim on the homepage. Fails silently to null if offline.
export function useLedger(intervalMs = 20000) {
  const [ledger, setLedger] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function poll() {
      try {
        const res = await fetch('https://horizon-testnet.stellar.org/');
        const data = await res.json();
        if (!cancelled && data.history_latest_ledger) {
          setLedger(data.history_latest_ledger);
        }
      } catch {
        // offline or blocked — leave last known value in place
      }
    }

    poll();
    const id = setInterval(poll, intervalMs);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [intervalMs]);

  return ledger;
}
