import { Link } from 'react-router-dom';
import { DealStatusBadge } from './StatusBadge';
import { formatNaira } from '../lib/currency';
import { rolesFor, ROLE_LABELS } from '../lib/roles';

export default function DealCard({ deal, address }) {
  const roles = rolesFor(address, deal);
  const releasedCount = deal.milestones.filter((m) => m.status === 'Released').length;

  return (
    <Link
      to={`/deals/${deal.id}`}
      className="block rounded-xl border border-brand-100 bg-white p-5 hover:border-brand-400 hover:shadow-sm transition"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-brand-900">{deal.cropType || 'Supply deal'} — {deal.quantity || ''}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {roles.map((r) => ROLE_LABELS[r]).join(' & ')} · Deal #{deal.id}
          </p>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-400 uppercase tracking-wide">Total value</p>
          <p className="text-lg font-semibold text-brand-800">{formatNaira(deal.totalAmount)}</p>
        </div>
        <p className="text-sm text-slate-500">
          {releasedCount} of {deal.milestones.length} milestones paid
        </p>
      </div>
    </Link>
  );
}
