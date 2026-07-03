import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { short } from '../lib/roles';

export default function Layout({ children }) {
  const { address, disconnect } = useWallet();

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 flex flex-col">
      <header className="sticky top-0 z-40 border-b border-white/5 bg-ink-950/80 backdrop-blur-xl">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-ink-950 shadow-[0_0_20px_rgba(52,211,153,0.3)]">
              ₦
            </span>
            <span className="font-semibold text-lg tracking-tight">AgroLock</span>
            <span className="status-pill glass text-brand-300 ml-1">
              <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" /> Testnet
            </span>
          </Link>
          {address && (
            <div className="flex items-center gap-3 text-sm">
              <span className="glass rounded-full px-3 py-1.5 text-slate-300 font-mono text-xs">{short(address)}</span>
              <button onClick={disconnect} className="text-slate-500 hover:text-brand-300 transition">
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-10">{children}</main>
      <footer className="border-t border-white/5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>AgroLock — milestone escrow for Nigerian smallholder farmers, built on Stellar &amp; Soroban.</p>
          <Link to="/" className="hover:text-brand-300 transition">
            ← Back to homepage
          </Link>
        </div>
      </footer>
    </div>
  );
}
