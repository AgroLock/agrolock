import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { api } from '../lib/api';
import DealCard from '../components/DealCard';

export default function Dashboard() {
  const { address } = useWallet();
  const [deals, setDeals] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    api
      .listDeals()
      .then((data) => setDeals(data.deals))
      .catch((err) => setError(err.message));
  }, []);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">Your deals</h1>
          <p className="text-sm text-slate-500">Every deal you're a buyer, farmer, or attestor on.</p>
        </div>
        <Link
          to="/deals/new"
          className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2 text-sm font-semibold text-ink-950 hover:brightness-110 transition"
        >
          + New deal
        </Link>
      </div>

      {error && <p className="text-sm text-rose-400 mb-4">{error}</p>}

      {deals === null && !error && <p className="text-slate-500">Loading your deals…</p>}

      {deals && deals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-10 text-center text-slate-500">
          No deals yet. Buyers can start one with "+ New deal" above.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {deals?.map((deal, i) => (
          <div key={deal.id} className="card-enter" style={{ animationDelay: `${i * 70}ms` }}>
            <DealCard deal={deal} address={address} />
          </div>
        ))}
      </div>
    </div>
  );
}
