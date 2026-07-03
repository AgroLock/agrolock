import { useWallet } from '../context/WalletContext';

export default function Connect() {
  const { connect, connecting, error } = useWallet();

  return (
    <div className="min-h-screen flex items-center justify-center bg-sand-50 px-4">
      <div className="max-w-md w-full text-center">
        <div className="mx-auto mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-brand-700 text-sand-50 text-2xl font-bold">
          ₦
        </div>
        <h1 className="text-2xl font-semibold text-brand-900">AgroLock</h1>
        <p className="mt-2 text-slate-600">
          Buyers pre-finance smallholder farmers with confidence. Funds only move when planting, growth, and
          delivery are confirmed by the people who were actually there.
        </p>

        <button
          onClick={connect}
          disabled={connecting}
          className="mt-8 w-full rounded-lg bg-brand-700 px-4 py-3 font-medium text-white hover:bg-brand-600 transition disabled:opacity-60"
        >
          {connecting ? 'Connecting…' : 'Connect Freighter wallet'}
        </button>

        {error && <p className="mt-3 text-sm text-rose-600">{error}</p>}

        <p className="mt-6 text-xs text-slate-400">
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
      </div>
    </div>
  );
}
