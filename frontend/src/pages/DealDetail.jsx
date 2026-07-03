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
        <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">
          ← Back to deals
        </Link>
        <p className="mt-4 text-rose-600">{error}</p>
      </div>
    );
  }

  if (!deal) return <p className="text-slate-500">Loading deal…</p>;

  const roles = rolesFor(address, deal);

  return (
    <div className="max-w-2xl mx-auto">
      <Link to="/dashboard" className="text-sm text-brand-600 hover:underline">
        ← Back to deals
      </Link>

      <div className="mt-4 flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-semibold text-brand-900">
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
          <div key={role} className="rounded-lg border border-brand-100 bg-white p-3">
            <p className="text-xs text-slate-400 uppercase">{ROLE_LABELS[role]}</p>
            <p className="font-medium text-brand-800 mt-1">{short(deal[role])}</p>
            {roles.includes(role) && <p className="text-xs text-brand-500 mt-0.5">You</p>}
          </div>
        ))}
      </div>

      <div className="mt-6 rounded-xl border border-brand-100 bg-white p-5 flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total escrowed value</p>
          <p className="text-2xl font-semibold text-brand-800">{formatNaira(deal.totalAmount)}</p>
        </div>
        {deal.status === 'Created' && roles.includes('buyer') && (
          <TxButton
            className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 transition"
            build={() => api.fund(deal.id)}
            onSuccess={handleSuccess('Deal funded — the milestone payments below are now locked in escrow.')}
            onError={setError}
          >
            Fund this deal
          </TxButton>
        )}
        {deal.status === 'Created' && !roles.includes('buyer') && (
          <span className="status-pill bg-amber-100 text-amber-800">Waiting for buyer to fund</span>
        )}
      </div>

      {notice && (
        <p className="mt-4 rounded-lg bg-brand-50 border border-brand-100 px-4 py-2.5 text-sm text-brand-700">
          {notice}
        </p>
      )}

      <h2 className="mt-8 mb-3 font-medium text-brand-800">Milestones</h2>
      <MilestoneTimeline
        deal={deal}
        address={address}
        roles={roles}
        onDone={handleSuccess('Done — the milestone status below has been updated.')}
        onError={setError}
      />

      {roles.length === 0 && (
        <p className="mt-4 text-sm text-slate-400">
          You're viewing this deal but aren't one of its parties, so there's nothing for you to sign here.
        </p>
      )}
    </div>
  );
}
