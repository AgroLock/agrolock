import { useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';

const STEPS = [
  {
    title: 'Agreement',
    body: "A buyer and a farmer agree on crop, quantity, price, delivery date, and a milestone schedule — right in the app.",
  },
  {
    title: 'Funding',
    body: 'The buyer commits the full amount upfront. It moves into escrow immediately, not into anyone\'s pocket.',
  },
  {
    title: 'Milestone tracking',
    body: 'A neutral local attestor — a cooperative officer or extension worker — verifies each stage of the growing cycle: planting, mid-season growth, delivery.',
  },
  {
    title: 'Multi-signature release',
    body: 'Each payment tranche needs sign-off from at least 2 of 3 parties (buyer, farmer, attestor) before it moves. No single party can act alone.',
  },
  {
    title: 'Cash-out',
    body: 'The farmer receives payment in Naira, tranche by tranche, as milestones are confirmed — not one risky lump sum at the end.',
  },
];

const PROBLEMS = [
  'Farmers need cash upfront for seed, fertilizer, and labour — before a single naira of revenue exists.',
  'Formal lenders treat farmers as high-risk with no collateral or credit history, so financing is unavailable or unaffordable.',
  "Buyers would often pay in advance to lock in supply, but have no reliable way to confirm a farmer will actually deliver.",
  'Informal middlemen fill the gap but leak value through fraud, underpayment, and delay — with no record left behind.',
];

export default function Home() {
  const { address, connect, connecting, error, checkingSession } = useWallet();
  const navigate = useNavigate();

  useEffect(() => {
    if (address) navigate('/dashboard');
  }, [address, navigate]);

  async function handleGetStarted() {
    await connect();
  }

  return (
    <div className="bg-sand-50 text-brand-900">
      <header className="border-b border-brand-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-700 text-sand-50 font-bold">
              ₦
            </span>
            <span className="font-semibold text-lg tracking-tight">AgroLock</span>
            <span className="status-pill bg-sand-100 text-brand-600 ml-1">Testnet demo</span>
          </div>
          <button
            onClick={handleGetStarted}
            disabled={connecting || checkingSession}
            className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet'}
          </button>
        </div>
      </header>

      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-16 pb-14 text-center">
        <h1 className="text-4xl sm:text-5xl font-semibold tracking-tight">
          Escrow that lets farmers get paid upfront — safely.
        </h1>
        <p className="mt-5 text-lg text-slate-600">
          AgroLock lets agricultural buyers pre-finance Nigerian smallholder farmers with confidence, and lets
          farmers access capital without collateral. Funds only move when planting, growth, and delivery are
          confirmed by the people who were actually there.
        </p>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={handleGetStarted}
            disabled={connecting || checkingSession}
            className="w-full sm:w-auto rounded-lg bg-brand-700 px-6 py-3 font-medium text-white hover:bg-brand-600 transition disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet to get started'}
          </button>
          <a
            href="#how-it-works"
            className="w-full sm:w-auto rounded-lg border border-brand-200 px-6 py-3 font-medium text-brand-700 hover:bg-white transition text-center"
          >
            See how it works
          </a>
        </div>
        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}
        <p className="mt-4 text-xs text-slate-400">
          This is a live demo on Stellar Testnet — no real money moves. Don't have Freighter?{' '}
          <a
            href="https://www.freighter.app/"
            target="_blank"
            rel="noreferrer"
            className="underline hover:text-brand-600"
          >
            Install it here
          </a>
          .
        </p>
      </section>

      <section className="bg-white border-y border-brand-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-14">
          <h2 className="text-2xl font-semibold text-center">The problem</h2>
          <p className="mt-2 text-center text-slate-500 max-w-2xl mx-auto">
            Capital that wants to reach farmers sits on the sidelines because there's no trusted way to release it
            conditionally, on terms both sides can verify.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {PROBLEMS.map((text, i) => (
              <div key={i} className="rounded-xl border border-brand-100 p-5 flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-rose-100 text-rose-600 text-xs font-semibold">
                  !
                </span>
                <p className="text-sm text-slate-600">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <h2 className="text-2xl font-semibold text-center">How AgroLock works</h2>
        <p className="mt-2 text-center text-slate-500 max-w-2xl mx-auto">
          Neither party has to trust the other on faith — the contract enforces the agreement.
        </p>
        <ol className="mt-10 space-y-6">
          {STEPS.map((step, i) => (
            <li key={step.title} className="flex gap-4 items-start">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-700 text-white font-semibold">
                {i + 1}
              </span>
              <div className="rounded-xl border border-brand-100 bg-white p-5 flex-1">
                <p className="font-semibold text-brand-900">{step.title}</p>
                <p className="mt-1 text-sm text-slate-600">{step.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-brand-700 text-sand-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-14 text-center">
          <h2 className="text-2xl font-semibold">Built on Stellar &amp; Soroban</h2>
          <p className="mt-3 text-brand-100">
            Milestone and multi-signature logic runs in a Soroban smart contract; Naira in, Naira out, through
            Stellar's low-cost payment rails — so neither farmer nor buyer ever needs to hold or understand
            cryptocurrency directly.
          </p>
          <button
            onClick={handleGetStarted}
            disabled={connecting || checkingSession}
            className="mt-7 rounded-lg bg-white px-6 py-3 font-medium text-brand-800 hover:bg-sand-100 transition disabled:opacity-60"
          >
            {connecting ? 'Connecting…' : 'Connect wallet to view live deals'}
          </button>
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-8">
        AgroLock — milestone escrow for Nigerian smallholder farmers, built on Stellar &amp; Soroban.{' '}
        <Link to="/" className="underline hover:text-brand-600">
          agrolock.app
        </Link>
      </footer>
    </div>
  );
}
