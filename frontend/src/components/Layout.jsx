import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { short } from '../lib/roles';

export default function Layout({ children }) {
  const { address, disconnect } = useWallet();

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-brand-100 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sand-50 font-bold">
              ₦
            </span>
            <span className="font-semibold text-lg tracking-tight">AgroLock</span>
            <span className="status-pill bg-sand-100 text-brand-600 ml-1">Testnet demo</span>
          </Link>
          {address && (
            <div className="flex items-center gap-3 text-sm">
              <span className="text-slate-500">{short(address)}</span>
              <button
                onClick={disconnect}
                className="text-slate-500 hover:text-brand-700 underline underline-offset-2"
              >
                Disconnect
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8">{children}</main>
      <footer className="text-center text-xs text-slate-400 py-6">
        AgroLock — milestone escrow for Nigerian smallholder farmers, built on Stellar &amp; Soroban.
      </footer>
    </div>
  );
}
