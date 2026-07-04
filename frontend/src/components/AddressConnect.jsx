import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

// Lets someone view their deals read-only by pasting a public address —
// an always-visible alternative to "Connect wallet" (Freighter), useful for
// anyone without the extension (mobile included, since Freighter can't be
// detected there at all). Deliberately read-only: every fund-moving action
// still requires a real Freighter signature, gated via useWallet().canSign.
// Error display is left to the parent (which already surfaces useWallet().error).
//
// `alwaysOpen` skips the "Or paste an address" toggle and renders the form
// directly, so it sits alongside the Connect wallet button rather than
// behind an extra click. `compact` trims it to a single row for tight
// spaces like the desktop nav bar.
export default function AddressConnect({ className = '', alwaysOpen = false, compact = false }) {
  const { connectWithAddress, connecting } = useWallet();
  const navigate = useNavigate();
  const [open, setOpen] = useState(alwaysOpen);
  const [value, setValue] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    const addr = await connectWithAddress(value.trim());
    if (addr) navigate('/dashboard');
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

  if (compact) {
    return (
      <form onSubmit={handleSubmit} className={`flex items-center gap-2 ${className}`}>
        <input
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="G... address"
          className="w-32 xl:w-40 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/50 font-mono"
        />
        <button
          type="submit"
          disabled={connecting || !value.trim()}
          className="rounded-lg glass px-3 py-2 text-xs font-medium text-slate-200 hover:border-brand-400/40 transition disabled:opacity-60 whitespace-nowrap"
        >
          {connecting ? 'Connecting…' : 'View read-only'}
        </button>
      </form>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`space-y-2 ${className}`}>
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="G..."
        autoFocus={!alwaysOpen}
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
        {!alwaysOpen && (
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-300 transition"
          >
            Cancel
          </button>
        )}
      </div>
      <p className="text-xs text-slate-600">
        Read-only — you'll be able to view deals, but signing any action still requires Freighter on desktop.
      </p>
    </form>
  );
}
