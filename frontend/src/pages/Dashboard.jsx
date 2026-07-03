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
          <h1 className="text-xl font-semibold text-brand-900">Your deals</h1>
          <p className="text-sm text-slate-500">Every deal you're a buyer, farmer, or attestor on.</p>
        </div>
        <Link
          to="/deals/new"
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition"
        >
          + New deal
        </Link>
      </div>

      {error && <p className="text-sm text-rose-600 mb-4">{error}</p>}

      {deals === null && !error && <p className="text-slate-500">Loading your deals…</p>}

      {deals && deals.length === 0 && (
        <div className="rounded-xl border border-dashed border-brand-200 bg-white p-10 text-center text-slate-500">
          No deals yet. Buyers can start one with "+ New deal" above.
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        {deals?.map((deal) => (
          <DealCard key={deal.id} deal={deal} address={address} />
        ))}
      </div>
    </div>
  );
}
