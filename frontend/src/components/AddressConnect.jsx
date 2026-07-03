import { useState } from 'react';
import { useWallet } from '../context/WalletContext';

// Lets someone view their deals read-only by pasting a public address —
// useful on mobile, where Freighter (a desktop browser extension) can't be
// detected at all. Deliberately read-only: every fund-moving action still
// requires a real Freighter signature, gated via useWallet().canSign. Error
// display is left to the parent (which already surfaces useWallet().error).
export default function AddressConnect({ className = '' }) {
  const { connectWithAddress, connecting } = useWallet();
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    await connectWithAddress(value.trim());
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`text-xs text-slate-500 underline hover:text-brand-300 transition ${className}`}
      >
        Or view read-only with a wallet address
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="G..."
        autoFocus
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/50 font-mono"
      />
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={connecting || !value.trim()}
          className="flex-1 rounded-lg glass px-3 py-2 text-sm font-medium text-slate-200 hover:border-brand-400/40 transition disabled:opacity-60"
        >
          {connecting ? 'Connecting…' : 'View deals (read-only)'}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition"
        >
          Cancel
        </button>
      </div>
      <p className="text-xs text-slate-600">
        Read-only — you'll be able to view deals, but signing any action still requires Freighter on desktop.
      </p>
    </form>
  );
}
