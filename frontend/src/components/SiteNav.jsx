import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useLedger } from '../hooks/useLedger';
import { IconMenu, IconX } from './icons';

const NAV_LINKS = [
  { to: '/', label: 'Home' },
  { to: '/about', label: 'About' },
  { to: '/how-it-works', label: 'How it works' },
  { to: '/technology', label: 'Technology' },
  { to: '/roadmap', label: 'Roadmap' },
  { to: 'https://github.com/Vicsygold/agrolock', label: 'GitHub', external: true },
];

export default function SiteNav() {
  const { address, connect, connecting, checkingSession } = useWallet();
  const navigate = useNavigate();
  const ledger = useLedger();
  const [menuOpen, setMenuOpen] = useState(false);

  async function handleConnect() {
    setMenuOpen(false);
    if (address) {
      navigate('/dashboard');
      return;
    }
    await connect();
  }

  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-ink-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]">
            ₦
          </span>
          <span className="font-semibold text-lg tracking-tight">AgroLock</span>
          <span className="hidden sm:inline-flex status-pill bg-white/5 text-brand-300 border border-white/10 ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 pulse-dot" />
            {ledger ? `Ledger #${ledger.toLocaleString()}` : 'Testnet live'}
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-7 text-sm text-slate-300">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noreferrer"
                className="hover:text-brand-300 transition"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                className={({ isActive }) =>
                  `transition ${isActive ? 'text-brand-300' : 'hover:text-brand-300'}`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={handleConnect}
            disabled={connecting || checkingSession}
            className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_25px_rgba(52,211,153,0.25)]"
          >
            {connecting ? 'Connecting…' : address ? 'Go to dashboard' : 'Connect wallet'}
          </button>
        </div>

        <button
          className="md:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-slate-300"
          onClick={() => setMenuOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {menuOpen ? <IconX /> : <IconMenu />}
        </button>
      </div>

      {menuOpen && (
        <div className="md:hidden border-t border-white/5 bg-ink-950/95 px-4 sm:px-6 py-4 space-y-4">
          {NAV_LINKS.map((link) =>
            link.external ? (
              <a
                key={link.label}
                href={link.to}
                target="_blank"
                rel="noreferrer"
                onClick={() => setMenuOpen(false)}
                className="block text-slate-300 hover:text-brand-300"
              >
                {link.label}
              </a>
            ) : (
              <NavLink
                key={link.label}
                to={link.to}
                end={link.to === '/'}
                onClick={() => setMenuOpen(false)}
                className={({ isActive }) =>
                  `block ${isActive ? 'text-brand-300' : 'text-slate-300 hover:text-brand-300'}`
                }
              >
                {link.label}
              </NavLink>
            )
          )}
          <button
            onClick={handleConnect}
            disabled={connecting || checkingSession}
            className="w-full rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : address ? 'Go to dashboard' : 'Connect wallet'}
          </button>
        </div>
      )}
    </header>
  );
}
