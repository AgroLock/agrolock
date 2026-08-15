import { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { api } from '../lib/api';
import DealCard from '../components/DealCard';

export default function Dashboard() {
  const { address } = useWallet();
  const [deals, setDeals] = useState(null);
  const [error, setError] = useState(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [sortBy, setSortBy] = useState('newest');

  useEffect(() => {
    api
      .listDeals()
      .then((data) => setDeals(data.deals))
      .catch((err) => setError(err.message));
  }, []);

  const filteredDeals = useMemo(() => {
    if (!deals) return [];
    let list = [...deals];

    // Status filtering
    if (activeTab === 'active') {
      list = list.filter((d) => d.status === 'Created' || d.status === 'Funded');
    } else if (activeTab === 'funded') {
      list = list.filter((d) => d.status === 'Funded');
    } else if (activeTab === 'disputed') {
      list = list.filter((d) => d.status === 'Disputed');
    } else if (activeTab === 'completed') {
      list = list.filter((d) => d.status === 'Completed');
    }

    // Search query filtering
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (d) =>
          d.id?.toLowerCase().includes(q) ||
          d.cropType?.toLowerCase().includes(q) ||
          d.buyer?.toLowerCase().includes(q) ||
          d.farmer?.toLowerCase().includes(q)
      );
    }

    // Sorting
    if (sortBy === 'newest') {
      list.sort((a, b) => (b.id || 0) - (a.id || 0));
    } else if (sortBy === 'oldest') {
      list.sort((a, b) => (a.id || 0) - (b.id || 0));
    } else if (sortBy === 'amount') {
      list.sort((a, b) => Number(BigInt(b.totalAmount || 0) - BigInt(a.totalAmount || 0)));
    }

    return list;
  }, [deals, activeTab, searchQuery, sortBy]);

  const counts = useMemo(() => {
    if (!deals) return { all: 0, active: 0, funded: 0, disputed: 0, completed: 0 };
    return {
      all: deals.length,
      active: deals.filter((d) => d.status === 'Created' || d.status === 'Funded').length,
      funded: deals.filter((d) => d.status === 'Funded').length,
      disputed: deals.filter((d) => d.status === 'Disputed').length,
      completed: deals.filter((d) => d.status === 'Completed').length,
    };
  }, [deals]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">Your Deals</h1>
          <p className="text-sm text-slate-400">Agile dashboard to monitor and manage all active escrows.</p>
        </div>
        <Link
          to="/deals/new"
          className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:brightness-110 transition shadow-[0_0_20px_rgba(52,211,153,0.25)]"
        >
          <span>+</span> Create New Deal
        </Link>
      </div>

      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-sm text-rose-300">
          {error}
        </div>
      )}

      {/* Agile Search, Filters, and Sorting Bar */}
      {deals && deals.length > 0 && (
        <div className="space-y-4 rounded-2xl glass-strong p-4 border border-white/10">
          <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
            {/* Search Input */}
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-3 flex items-center text-slate-400 text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by Crop, Escrow ID, Buyer or Farmer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-ink-950/60 pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:border-brand-400 focus:outline-none transition"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-3 text-xs text-slate-500 hover:text-slate-300"
                >
                  Clear
                </button>
              )}
            </div>

            {/* Sort By Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-xs text-slate-400 font-medium">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="rounded-xl border border-white/10 bg-ink-950/60 px-3 py-2 text-xs font-medium text-slate-200 focus:border-brand-400 focus:outline-none"
              >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="amount">Highest Amount</option>
              </select>
            </div>
          </div>

          {/* Status Filter Tabs */}
          <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-white/5">
            {[
              { key: 'all', label: 'All Deals', count: counts.all },
              { key: 'active', label: 'Active', count: counts.active },
              { key: 'funded', label: 'Funded', count: counts.funded },
              { key: 'disputed', label: 'Disputed', count: counts.disputed },
              { key: 'completed', label: 'Completed', count: counts.completed },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  activeTab === tab.key
                    ? 'bg-brand-500/20 text-brand-300 border border-brand-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`}
              >
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] text-slate-300 font-mono">
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Loading state */}
      {deals === null && !error && (
        <div className="flex items-center justify-center p-12 text-slate-500 text-sm animate-pulse">
          Loading deals from Soroban RPC...
        </div>
      )}

      {/* Zero initial deals */}
      {deals && deals.length === 0 && (
        <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center text-slate-500 space-y-3">
          <p className="text-base font-medium text-slate-400">No active escrow deals found</p>
          <p className="text-xs">Buyers can initiate a secure deal with "+ Create New Deal" above.</p>
        </div>
      )}

      {/* Filtered zero results */}
      {deals && deals.length > 0 && filteredDeals.length === 0 && (
        <div className="rounded-2xl border border-white/10 glass p-10 text-center text-slate-400 space-y-3">
          <p className="text-sm">No deals matched your current search and filter criteria.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setActiveTab('all');
            }}
            className="text-xs text-brand-300 underline hover:text-brand-200"
          >
            Reset search &amp; filters
          </button>
        </div>
      )}

      {/* Deals Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredDeals.map((deal, i) => (
          <div key={deal.id} className="card-enter" style={{ animationDelay: `${i * 60}ms` }}>
            <DealCard deal={deal} address={address} />
          </div>
        ))}
      </div>
    </div>
  );
}
