import { useState } from 'react';
import { useWallet } from '../context/WalletContext';
import { signWithFreighter } from '../lib/freighter';
import { api } from '../lib/api';

// Runs the standard build-unsigned -> sign-with-Freighter -> submit flow.
// `build` returns { unsignedXdr } from our backend; the signed result is
// posted to /tx/submit (or a custom `submitFn` for special cases like deal
// creation, which needs to resolve a local draft id).
//
// If the session was established read-only (pasted address, no Freighter),
// this renders a disabled hint instead of an actionable button — signing
// always requires a real wallet, so there's nothing this button could do.
export default function TxButton({
  build,
  submitFn,
  onSuccess,
  onError,
  className = '',
  children,
  confirmLabel,
}) {
  const { address, canSign } = useWallet();
  const [busy, setBusy] = useState(false);
  const [step, setStep] = useState(null);

  async function handleClick() {
    setBusy(true);
    setStep('Preparing transaction…');
    try {
      const { unsignedXdr } = await build();
      setStep('Waiting for your signature in Freighter…');
      const signedXdr = await signWithFreighter(unsignedXdr, address);
      setStep('Sending to Stellar Testnet…');
      const result = submitFn ? await submitFn(signedXdr) : await api.submitTx(signedXdr);
      onSuccess?.(result);
    } catch (err) {
      onError?.(err.message || String(err));
    } finally {
      setBusy(false);
      setStep(null);
    }
  }

  if (!canSign) {
    return (
      <span
        title="Connect with Freighter on a desktop browser to sign this"
        className={`${className} opacity-50 cursor-not-allowed`}
      >
        {confirmLabel || children} 🔒
      </span>
    );
  }

  return (
    <button
      type="button"
      disabled={busy}
      onClick={handleClick}
      className={`${className} disabled:cursor-not-allowed disabled:opacity-60`}
    >
      {busy ? step || 'Working…' : confirmLabel || children}
    </button>
  );
}
