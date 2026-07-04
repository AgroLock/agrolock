import { useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { useLedger } from '../hooks/useLedger';
import { useInView } from '../hooks/useInView';
import Reveal from '../components/Reveal';
import TiltPanel from '../components/TiltPanel';
import SiteNav from '../components/SiteNav';
import SiteFooter from '../components/SiteFooter';
import SectionHeading from '../components/SectionHeading';
import AddressConnect from '../components/AddressConnect';
import { IconSparkle, IconAlert, IconHandshake, IconShield, IconLayers, IconArrowRight } from '../components/icons';

const STATS = [
  { label: 'Milestone quorum', value: '2-of-3' },
  { label: 'Settlement finality', value: '< 5 sec' },
  { label: 'Network fees', value: '~$0.00001' },
  { label: 'Live demo deals', value: '4' },
];

const PROBLEMS = [
  {
    title: 'No collateral, no credit',
    body: "Farmers need cash upfront for seed, fertilizer, and labour — before a single naira of revenue exists, and formal lenders won't touch them.",
  },
  {
    title: 'No proof of delivery',
    body: 'Buyers would gladly pay in advance to lock in supply, but have no reliable way to confirm a farmer will actually plant, tend, and deliver.',
  },
];

const HIGHLIGHTS = [
  { icon: IconHandshake, title: 'Agreement in the app', body: 'Buyer and farmer set crop, price, and a milestone schedule together.' },
  { icon: IconShield, title: '2-of-3 multi-signature', body: 'Buyer, farmer, and attestor — no single party moves funds alone.' },
  { icon: IconLayers, title: 'Naira in, Naira out', body: 'Stablecoin settlement runs underneath; the UI only ever shows Naira.' },
];

export default function Home() {
  const { connect, connecting, error, checkingSession } = useWallet();
  const navigate = useNavigate();
  const ledger = useLedger();

  // Navigate only right after a successful connect from this page — not on
  // every visit to "/" while already connected, which would make the
  // homepage (and "Back to homepage" links) unreachable once signed in.
  async function handleGetStarted() {
    const addr = await connect();
    if (addr) navigate('/dashboard');
  }

  return (
    <div className="text-slate-100 selection:bg-brand-400/30">
      <SiteNav />
      <Hero connecting={connecting} checkingSession={checkingSession} onConnect={handleGetStarted} error={error} />
      <StatsBar ledger={ledger} />
      <ProblemTeaser />
      <HighlightsTeaser />
      <GrantFoxSection />
      <FinalCta connecting={connecting} checkingSession={checkingSession} onConnect={handleGetStarted} />
      <SiteFooter />
    </div>
  );
}

function Hero({ connecting, checkingSession, onConnect, error }) {
  const sectionRef = useRef(null);

  function onMouseMove(e) {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    el.style.setProperty('--px', px.toFixed(3));
    el.style.setProperty('--py', py.toFixed(3));
  }

  return (
    <section
      ref={sectionRef}
      onMouseMove={onMouseMove}
      className="relative pt-20 pb-24 sm:pt-28 sm:pb-32 overflow-hidden"
      style={{ '--px': 0, '--py': 0 }}
    >
      <div
        className="blob h-72 w-72 bg-brand-500 -top-10 left-[8%]"
        style={{ transform: 'translate(calc(var(--px) * -30px), calc(var(--py) * -30px))' }}
      />
      <div
        className="blob h-80 w-80 bg-gold-500 top-24 right-[5%]"
        style={{ animationDelay: '-6s', transform: 'translate(calc(var(--px) * 40px), calc(var(--py) * 40px))' }}
      />
      <div
        className="blob h-64 w-64 bg-brand-300 bottom-0 left-[35%]"
        style={{ animationDelay: '-11s', transform: 'translate(calc(var(--px) * -20px), calc(var(--py) * 20px))' }}
      />

      <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <Link
          to="/about"
          className="inline-flex items-center gap-2 status-pill glass text-brand-200 mb-6 reveal in-view hover:border-brand-400/40 transition"
        >
          <IconSparkle /> Built for the Stellar GrantFox Maintainer Program
        </Link>
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
            className="shimmer w-full sm:w-auto rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-7 py-3.5 font-semibold text-ink-950 hover:brightness-110 hover:-translate-y-0.5 transition disabled:opacity-60 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
          >
            {connecting ? 'Connecting…' : 'Connect wallet to get started →'}
          </button>
          <Link
            to="/how-it-works"
            className="w-full sm:w-auto rounded-xl glass px-7 py-3.5 font-semibold text-slate-200 hover:border-brand-400/40 hover:-translate-y-0.5 transition text-center"
          >
            See how it works
          </Link>
        </div>
        {error && <p className="mt-4 text-sm text-rose-400 max-w-md mx-auto">{error}</p>}

        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-xs text-slate-500">or, no wallet needed —</p>
          <AddressConnect alwaysOpen compact />
        </div>

        <p className="mt-5 text-xs text-slate-500 sm:hidden">
          Freighter is a desktop browser extension — open this site on a desktop browser (Chrome, Firefox, Brave,
          or Edge) with Freighter installed to sign transactions.
        </p>
        <p className="mt-5 text-xs text-slate-500 hidden sm:block">
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

function StatsBar({ ledger }) {
  const [ref, inView] = useInView();
  const items = ledger ? [...STATS, { label: 'Current ledger', value: `#${ledger.toLocaleString()}` }] : STATS;
  return (
    <section ref={ref} className="relative border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-6">
        {items.map((s, i) => (
          <div
            key={s.label}
            className={`text-center stat-pop ${inView ? 'in-view' : ''}`}
            style={{ animationDelay: `${i * 90}ms` }}
          >
            <p className="text-2xl sm:text-3xl font-semibold gradient-text">{s.value}</p>
            <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">{s.label}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function ProblemTeaser() {
  return (
    <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
      <Reveal>
        <div className="flex items-end justify-between flex-wrap gap-4">
          <SectionHeading eyebrow="The problem" title="Capital that can't reach the ground" />
          <Link to="/about" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 hover:text-brand-200 transition shrink-0">
            Read the full picture <IconArrowRight />
          </Link>
        </div>
      </Reveal>
      <div className="mt-12 grid sm:grid-cols-2 gap-5">
        {PROBLEMS.map((p, i) => (
          <Reveal key={p.title} delay={i * 80}>
            <TiltPanel className="glass rounded-2xl p-6 h-full">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <IconAlert />
              </div>
              <p className="mt-4 font-semibold text-slate-100">{p.title}</p>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">{p.body}</p>
            </TiltPanel>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

function HighlightsTeaser() {
  return (
    <section className="relative py-24 border-y border-white/5 bg-white/[0.02]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <Reveal>
          <div className="flex items-end justify-between flex-wrap gap-4">
            <SectionHeading eyebrow="How it works" title="Neither party has to trust the other on faith" />
            <Link to="/how-it-works" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-300 hover:text-brand-200 transition shrink-0">
              Walk through every step <IconArrowRight />
            </Link>
          </div>
        </Reveal>
        <div className="mt-12 grid sm:grid-cols-3 gap-5">
          {HIGHLIGHTS.map((h, i) => (
            <Reveal key={h.title} delay={i * 80}>
              <TiltPanel className="glass rounded-2xl p-6 h-full">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/20 to-brand-700/20 text-brand-300 border border-brand-400/20">
                  <h.icon />
                </div>
                <p className="mt-4 font-semibold text-slate-100">{h.title}</p>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">{h.body}</p>
              </TiltPanel>
            </Reveal>
          ))}
        </div>
        <Reveal delay={240}>
          <div className="mt-8 flex flex-wrap gap-3 text-xs text-slate-500">
            <Link to="/technology" className="glass rounded-full px-4 py-1.5 hover:text-brand-300 transition">
              Why Stellar &amp; Soroban →
            </Link>
            <a
              href="https://stellar.expert/explorer/testnet/contract/CCJL3R2YW6QRAOD2WOWYPQ5IJPC4YDTAGGPH6LHVXA2SD44FYAQIIU2B"
              target="_blank"
              rel="noreferrer"
              className="glass rounded-full px-4 py-1.5 hover:text-brand-300 transition"
            >
              View contract on stellar.expert ↗
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function GrantFoxSection() {
  return (
    <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
      <Reveal>
        <TiltPanel max={3} className="glass-strong rounded-3xl p-8 sm:p-10 grid sm:grid-cols-[1fr_auto] gap-6 items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-brand-400">GrantFox Maintainer Program</p>
            <h2 className="mt-3 text-2xl sm:text-3xl font-semibold tracking-tight">
              Real-world financial infrastructure, not a token bolted onto an app
            </h2>
            <p className="mt-3 text-slate-400 leading-relaxed max-w-2xl">
              AgroLock is submitted to the Stellar GrantFox Maintainer Program as real-world asset financing for
              underserved populations — built with Soroban's actual programmability, developed by Victor Ameh.
            </p>
          </div>
          <Link
            to="/about"
            className="shrink-0 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-6 py-3 font-semibold text-ink-950 hover:brightness-110 transition text-center"
          >
            Read the proposal
          </Link>
        </TiltPanel>
      </Reveal>
    </section>
  );
}

function FinalCta({ connecting, checkingSession, onConnect }) {
  return (
    <section className="relative max-w-5xl mx-auto px-4 sm:px-6 py-24 text-center">
      <div className="blob h-80 w-80 bg-brand-500 top-0 left-1/2 -translate-x-1/2" />
      <Reveal>
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
            className="shimmer mt-8 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-8 py-3.5 font-semibold text-ink-950 hover:brightness-110 hover:-translate-y-0.5 transition disabled:opacity-60 shadow-[0_0_40px_rgba(52,211,153,0.3)]"
          >
            {connecting ? 'Connecting…' : 'Connect wallet to view live deals'}
          </button>
        </div>
      </Reveal>
    </section>
  );
}
