import { useCallback, useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useWallet } from '../context/WalletContext';
import { api } from '../lib/api';
import { DealStatusBadge } from '../components/StatusBadge';
import MilestoneTimeline from '../components/MilestoneTimeline';
import TxButton from '../components/TxButton';
import { formatNaira } from '../lib/currency';
import { rolesFor, ROLE_LABELS, short } from '../lib/roles';

export default function DealDetail() {
  const { id } = useParams();
  const { address } = useWallet();
  const [deal, setDeal] = useState(null);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);

  const refresh = useCallback(() => {
    setError(null);
    api
      .getDeal(id)
      .then((data) => setDeal(data.deal))
      .catch((err) => setError(err.message));
  }, [id]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  function handleSuccess(message) {
    return () => {
      setNotice(message);
      refresh();
      setTimeout(() => setNotice(null), 4000);
    };
  }

  if (error) {
    return (
      <div>
        <Link to="/dashboard" className="text-sm text-brand-300 hover:underline">
          ← Back to deals
        </Link>
        <p className="mt-4 text-rose-400">{error}</p>
      </div>
    );
  }

  if (!deal) return <p className="text-slate-500">Loading deal…</p>;

  const roles = rolesFor(address, deal);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/dashboard" className="text-sm text-brand-300 hover:underline">
        ← Back to deals
      </Link>

      <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-slate-100">
            {deal.cropType || 'Supply deal'} {deal.quantity ? `— ${deal.quantity}` : ''}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Deal #{deal.id} {deal.deliveryDate ? `· Expected delivery ${deal.deliveryDate}` : ''}
          </p>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 text-sm">
        {['buyer', 'farmer', 'attestor'].map((role) => (
          <div key={role} className="glass rounded-xl p-3">
            <p className="text-xs text-slate-500 uppercase">{ROLE_LABELS[role]}</p>
            <p className="font-medium text-slate-200 mt-1 font-mono text-xs sm:text-sm">{short(deal[role])}</p>
            {roles.includes(role) && <p className="text-xs text-brand-300 mt-0.5">You</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total escrowed value</p>
          <p className="text-2xl font-semibold gradient-text">{formatNaira(deal.totalAmount)}</p>
        </div>
        {deal.status === 'Created' && roles.includes('buyer') && (
          <TxButton
            className="rounded-lg bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-2.5 text-sm font-semibold text-ink-950 hover:brightness-110 transition"
            build={() => api.fund(deal.id)}
            onSuccess={handleSuccess('Deal funded — the milestone payments below are now locked in escrow.')}
            onError={setError}
          >
            Fund this deal
          </TxButton>
        )}
        {deal.status === 'Created' && !roles.includes('buyer') && (
          <span className="status-pill bg-gold-400/10 text-gold-300 border border-gold-400/20">Waiting for buyer to fund</span>
        )}
      </div>

      {notice && (
        <p className="mt-4 rounded-xl glass px-4 py-2.5 text-sm text-brand-300">
          {notice}
        </p>
      )}

      <h2 className="mt-8 mb-3 font-medium text-slate-200">Milestones</h2>
      <MilestoneTimeline
        deal={deal}
        address={address}
        roles={roles}
        onDone={handleSuccess('Done — the milestone status below has been updated.')}
        onError={setError}
      />

      {roles.length === 0 && (
        <p className="mt-4 text-sm text-slate-500">
          You're viewing this deal but aren't one of its parties, so there's nothing for you to sign here.
        </p>
      )}
    </div>
  );
}
