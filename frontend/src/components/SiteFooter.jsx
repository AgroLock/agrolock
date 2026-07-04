import { Link } from 'react-router-dom';
import { useLedger } from '../hooks/useLedger';

export default function SiteFooter() {
  const ledger = useLedger();

  return (
    <footer className="border-t border-white/5">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-ink-950">
              ₦
            </span>
            <span className="font-semibold text-lg">AgroLock</span>
          </div>
          <p className="mt-4 text-sm text-slate-500 leading-relaxed">
            Milestone escrow for Nigerian smallholder farmers, built on Stellar &amp; Soroban.
          </p>
        </div>

        <FooterColumn
          title="Product"
          links={[
            { label: 'About', to: '/about' },
            { label: 'How it works', to: '/how-it-works' },
            { label: 'Technology & security', to: '/technology' },
            { label: 'Roadmap', to: '/roadmap' },
          ]}
        />
        <FooterColumn
          title="Resources"
          links={[
            { label: 'Source on GitHub', to: 'https://github.com/Vicsygold/agrolock', external: true },
            { label: 'Freighter wallet', to: 'https://www.freighter.app/', external: true },
            { label: 'Stellar developer docs', to: 'https://developers.stellar.org/', external: true },
          ]}
        />
        <FooterColumn
          title="Network"
          links={[
            {
              label: 'AgroLock contract ↗',
              to: 'https://stellar.expert/explorer/testnet/contract/CCJL3R2YW6QRAOD2WOWYPQ5IJPC4YDTAGGPH6LHVXA2SD44FYAQIIU2B',
              external: true,
            },
            {
              label: 'NGNT token contract ↗',
              to: 'https://stellar.expert/explorer/testnet/contract/CC6NI3W4IVWTVUDAGACW6QLOJHD3RA346FOKTSSFKVSU27N63NWKAOWP',
              external: true,
            },
          ]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AgroLock. Testnet demo — no real funds are at risk.</p>
          <span className="status-pill glass text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 pulse-dot" />
            {ledger ? `Live · Ledger #${ledger.toLocaleString()}` : 'Stellar Testnet'}
          </span>
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="text-sm font-semibold text-slate-200">{title}</p>
      <ul className="mt-4 space-y-3">
        {links.map((link) => (
          <li key={link.label}>
            {link.external ? (
              <a
                href={link.to}
                target="_blank"
                rel="noreferrer"
                className="text-sm text-slate-500 hover:text-brand-300 transition"
              >
                {link.label}
              </a>
            ) : (
              <Link to={link.to} className="text-sm text-slate-500 hover:text-brand-300 transition">
                {link.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
