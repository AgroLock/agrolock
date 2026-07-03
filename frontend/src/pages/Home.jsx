import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const NAV_LINKS = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#security', label: 'Security' },
  { href: '#stack', label: 'Tech stack' },
  { href: 'https://github.com/Vicsygold/agrolock', label: 'GitHub', external: true },
];

const STATS = [
  { label: 'Milestone quorum', value: '2-of-3' },
  { label: 'Settlement finality', value: '< 5 sec' },
  { label: 'Network fees', value: '~$0.00001' },
  { label: 'Live demo deals', value: '4' },
];

const STEPS = [
  {
    title: 'Agreement',
    icon: IconHandshake,
    body: 'A buyer and a farmer agree on crop, quantity, price, delivery date, and a milestone schedule — right in the app.',
  },
  {
    title: 'Funding',
    icon: IconLock,
    body: "The buyer commits the full amount upfront. It moves into escrow immediately, not into anyone's pocket.",
  },
  {
    title: 'Milestone tracking',
    icon: IconSprout,
    body: 'A neutral local attestor — a cooperative officer or extension worker — verifies each stage: planting, mid-season growth, delivery.',
  },
  {
    title: 'Multi-signature release',
    icon: IconShield,
    body: 'Each tranche needs sign-off from at least 2 of 3 parties before it moves. No single party can act alone.',
  },
  {
    title: 'Cash-out',
    icon: IconCoins,
    body: 'The farmer receives payment in Naira, tranche by tranche, as milestones are confirmed — not one risky lump sum.',
  },
];

const PROBLEMS = [
  {
    title: 'No collateral, no credit',
    body: 'Farmers need cash upfront for seed, fertilizer, and labour — before a single naira of revenue exists, and formal lenders won\'t touch them.',
  },
  {
    title: 'No proof of delivery',
    body: "Buyers would gladly pay in advance to lock in supply, but have no reliable way to confirm a farmer will actually plant, tend, and deliver.",
  },
  {
    title: 'Value leaks through middlemen',
    body: 'Informal cooperatives and brokers fill the gap but leak value through fraud, underpayment, and delay — with no usable record left behind.',
  },
  {
    title: 'Capital sits idle',
    body: 'The result: money that wants to reach farmers stays on the sidelines because there\'s no trusted way to release it conditionally.',
  },
];

const STACK = [
  { name: 'Soroban', body: 'Programmable milestone + multi-sig logic a plain payment rail can\'t express.' },
  { name: 'Stellar', body: 'Sub-second finality and near-zero fees fit small, frequent agricultural payments.' },
  { name: 'Anchors', body: 'Naira in, Naira out — the stablecoin settlement stays invisible to both sides.' },
];

export default function Home() {
  const { address, connect, connecting, error, checkingSession } = useWallet();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (address) navigate('/dashboard');
  }, [address, navigate]);

  async function handleGetStarted() {
    setMenuOpen(false);
    await connect();
  }

  return (
    <div className="min-h-screen bg-ink-950 text-slate-100 selection:bg-brand-400/30 overflow-x-hidden">
      <Nav connecting={connecting} checkingSession={checkingSession} onConnect={handleGetStarted} menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
      <Hero connecting={connecting} checkingSession={checkingSession} onConnect={handleGetStarted} error={error} />
      <StatsBar />
      <ProblemSection />
      <HowItWorks />
      <SecuritySection />
      <StackSection />
      <FinalCta connecting={connecting} checkingSession={checkingSession} onConnect={handleGetStarted} />
      <Footer />
    </div>
  );
}

function Nav({ connecting, checkingSession, onConnect, menuOpen, setMenuOpen }) {
  return (
    <header className="sticky top-0 z-50 border-b border-white/5 bg-ink-950/70 backdrop-blur-xl">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <a href="#top" className="flex items-center gap-2.5 shrink-0">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 to-brand-700 font-bold text-ink-950 shadow-[0_0_20px_rgba(52,211,153,0.35)]">
            ₦
          </span>
          <span className="font-semibold text-lg tracking-tight">AgroLock</span>
          <span className="hidden sm:inline-flex status-pill bg-white/5 text-brand-300 border border-white/10 ml-1">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" /> Testnet live
          </span>
        </a>

        <nav className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className="hover:text-brand-300 transition"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden md:block">
          <button
            onClick={onConnect}
            disabled={connecting || checkingSession}
            className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_25px_rgba(52,211,153,0.25)]"
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
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
          {NAV_LINKS.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              onClick={() => setMenuOpen(false)}
              className="block text-slate-300 hover:text-brand-300"
            >
              {link.label}
            </a>
          ))}
          <button
            onClick={onConnect}
            disabled={connecting || checkingSession}
            className="w-full rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2.5 text-sm font-semibold text-ink-950 disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        </div>
      )}
    </header>
  );
}

function Hero({ connecting, checkingSession, onConnect, error }) {
  return (
    <section id="top" className="relative pt-20 pb-24 sm:pt-28 sm:pb-32">
      <div className="absolute inset-0 grid-overlay" />
      <div className="blob h-72 w-72 bg-brand-500 -top-10 left-[8%]" />
      <div className="blob h-80 w-80 bg-gold-500 top-24 right-[5%]" style={{ animationDelay: '-6s' }} />
      <div className="blob h-64 w-64 bg-brand-300 bottom-0 left-[35%]" style={{ animationDelay: '-11s' }} />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <span className="inline-flex items-center gap-2 status-pill glass text-brand-200 mb-6">
          <IconSparkle /> Built for the GrantFox Maintainer Program &middot; Stellar &amp; Soroban
        </span>
        <h1 className="text-5xl sm:text-6xl font-semibold tracking-tight leading-[1.05]">
          Escrow that lets farmers <span className="gradient-text">get paid upfront</span> — safely.
        </h1>
        <p className="mt-6 text-lg text-slate-400 max-w-2xl mx-auto">
          AgroLock lets agricultural buyers pre-finance Nigerian smallholder farmers with confidence, and lets
          farmers access capital without collateral. Funds only move when planting, growth, and delivery are
          confirmed on-chain by the people who were actually there.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={onConnect}
            disabled={connecting || checkingSession}
            className="w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-7 py-3.5 font-semibold text-ink-950 hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
          >
            {connecting ? 'Connecting…' : 'Connect wallet to get started →'}
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto rounded-xl glass px-7 py-3.5 font-semibold text-slate-200 hover:border-brand-400/40 transition text-center"
          >
            See how it works
          </a>
        </div>
        {error && <p className="mt-4 text-sm text-rose-400">{error}</p>}
        <p className="mt-5 text-xs text-slate-500">
          Live demo on Stellar Testnet — no real money moves. Don't have Freighter?{' '}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brand-300"
          >
            Install it here
          </a>
          .
        </p>
      </div>
    </section>
  );
}

function StatsBar() {
  return (
    <section className="relative border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 gap-6">
        {STATS.map((s) => (
          <div key={s.label} className="text-center">
            <p className="text-2xl sm:text-3xl font-semibold gradient-text">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemSection() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHeading eyebrow="The problem" title="Capital that can't reach the ground" />
      <div className="mt-12 grid sm:grid-cols-2 gap-5">
        {PROBLEMS.map((p) => (
          <div key={p.title} className="glass glow-border rounded-2xl p-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <IconAlert />
            </div>
            <p className="mt-4 font-semibold text-slate-100">{p.title}</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHeading eyebrow="How it works" title="Neither party has to trust the other on faith" />
      <div className="mt-12 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {STEPS.map((step, i) => (
          <div key={step.title} className="glass glow-border rounded-2xl p-6 relative">
            <span className="absolute top-5 right-5 text-4xl font-bold text-white/5">{`0${i + 1}`}</span>
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-700/20 text-brand-300 border border-brand-400/20">
              <step.icon />
            </div>
            <p className="mt-4 font-semibold text-slate-100">{step.title}</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{step.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function SecuritySection() {
  const points = [
    { title: '2-of-3 multi-signature', body: 'Buyer, farmer, and attestor — no single party can move funds alone, in either direction.' },
    { title: 'Dispute → refund path', body: 'A missed milestone doesn\'t mean total loss. Any party can flag it, and quorum can refund the buyer instead.' },
    { title: 'On-chain, auditable', body: 'Every escrow, vote, and payout is a public transaction — the foundation for a future credit history.' },
  ];
  return (
    <section id="security" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <SectionHeading eyebrow="Security" title="Programmable trust, not blind trust" />
      <div className="mt-12 grid sm:grid-cols-3 gap-5">
        {points.map((p) => (
          <div key={p.title} className="rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent p-6">
            <IconShield className="text-gold-400" />
            <p className="mt-4 font-semibold text-slate-100">{p.title}</p>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function StackSection() {
  return (
    <section id="stack" className="relative py-24 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <SectionHeading eyebrow="Tech stack" title="Built on Stellar & Soroban" />
        <p className="mt-4 text-slate-400 max-w-2xl">
          Not a payments app with a blockchain bolted on — the milestone escrow genuinely needs a programmable,
          multi-party contract layer, and Stellar's cost profile makes it viable at agricultural transaction sizes.
        </p>
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {STACK.map((s) => (
            <div key={s.name} className="glass rounded-2xl p-6">
              <p className="font-semibold text-brand-300">{s.name}</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-500">
          <a
            href="https://stellar.expert/explorer/testnet/contract/CCJL3R2YW6QRAOD2WOWYPQ5IJPC4YDTAGGPH6LHVXA2SD44FYAQIIU2B"
            target="_blank"
            rel="noreferrer"
            className="glass rounded-full px-4 py-1.5 hover:text-brand-300 transition"
          >
            View AgroLock contract on stellar.expert ↗
          </a>
          <a
            href="https://github.com/Vicsygold/agrolock"
            target="_blank"
            rel="noreferrer"
            className="glass rounded-full px-4 py-1.5 hover:text-brand-300 transition"
          >
            Source on GitHub ↗
          </a>
        </div>
      </div>
    </section>
  );
}

function FinalCta({ connecting, checkingSession, onConnect }) {
  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="blob h-80 w-80 bg-brand-500 top-0 left-1/2 -translate-x-1/2" />
      <div className="relative glass-strong rounded-3xl px-8 py-16">
        <h2 className="text-3xl sm:text-4xl font-semibold">
          See a real escrow move on <span className="gradient-text">Stellar Testnet</span>
        </h2>
        <p className="mt-4 text-slate-400 max-w-xl mx-auto">
          Connect a wallet to view four live demo deals — funded, mid-milestone, disputed, and completed — or
          create your own in under a minute.
        </p>
        <button
          onClick={onConnect}
          disabled={connecting || checkingSession}
          className="mt-8 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-3.5 font-semibold text-ink-950 hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
        >
          {connecting ? 'Connecting…' : 'Connect wallet to view live deals'}
        </button>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title }) {
  return (
    <div className="max-w-2xl">
      <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">{eyebrow}</p>
      <h2 className="mt-3 text-3xl sm:text-4xl font-semibold tracking-tight">{title}</h2>
    </div>
  );
}

function Footer() {
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
            { label: 'How it works', href: '#how-it-works' },
            { label: 'Security model', href: '#security' },
            { label: 'Tech stack', href: '#stack' },
          ]}
        />
        <FooterColumn
          title="Resources"
          links={[
            { label: 'Source on GitHub', href: 'https://github.com/Vicsygold/agrolock', external: true },
            { label: 'Freighter wallet', href: 'https://www.freighter.app/', external: true },
            { label: 'Stellar developer docs', href: 'https://developers.stellar.org/', external: true },
          ]}
        />
        <FooterColumn
          title="Network"
          links={[
            {
              label: 'AgroLock contract ↗',
              href: 'https://stellar.expert/explorer/testnet/contract/CCJL3R2YW6QRAOD2WOWYPQ5IJPC4YDTAGGPH6LHVXA2SD44FYAQIIU2B',
              external: true,
            },
            {
              label: 'NGNT token contract ↗',
              href: 'https://stellar.expert/explorer/testnet/contract/CC6NI3W4IVWTVUDAGACW6QLOJHD3RA346FOKTSSFKVSU27N63NWKAOWP',
              external: true,
            },
          ]}
        />
      </div>
      <div className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} AgroLock. Testnet demo — no real funds are at risk.</p>
          <span className="status-pill glass text-brand-300">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-400 animate-pulse" /> Stellar Testnet
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
            <a
              href={link.href}
              target={link.external ? '_blank' : undefined}
              rel={link.external ? 'noreferrer' : undefined}
              className="text-sm text-slate-500 hover:text-brand-300 transition"
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

// --- Minimal inline icon set (no external icon dependency) ---
function IconSparkle() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2l2.2 6.8L21 11l-6.8 2.2L12 20l-2.2-6.8L3 11l6.8-2.2z" />
    </svg>
  );
}
function IconMenu() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
    </svg>
  );
}
function IconX() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 9v4m0 4h.01M10.3 3.9L2.7 17a1.5 1.5 0 001.3 2.3h16a1.5 1.5 0 001.3-2.3L13.7 3.9a1.5 1.5 0 00-2.6 0z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconHandshake() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12l5-5 4 3 4-3 5 5-3 3-3-2-3 2-3-2z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconLock() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V7a4 4 0 018 0v4" />
    </svg>
  );
}
function IconSprout() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22V12M12 12C12 8 9 6 5 6c0 4 3 6 7 6zM12 12c0-4 3-6 7-6 0 4-3 6-7 6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconShield({ className = '' }) {
  return (
    <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 2l8 4v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6z" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function IconCoins() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="9" cy="7" rx="6" ry="3" />
      <path d="M3 7v5c0 1.7 2.7 3 6 3s6-1.3 6-3V7M9 15v2c0 1.7 2.7 3 6 3s6-1.3 6-3v-2M21 12c0 1.7-2.7 3-6 3" strokeLinecap="round" />
    </svg>
  );
}
