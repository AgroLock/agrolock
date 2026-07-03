import { Link } from 'react-router-dom';
import { DealStatusBadge } from './StatusBadge';
import { formatNaira } from '../lib/currency';
import { rolesFor, ROLE_LABELS } from '../lib/roles';
import { useTilt3D } from '../hooks/useTilt3D';

export default function DealCard({ deal, address }) {
  const roles = rolesFor(address, deal);
  const releasedCount = deal.milestones.filter((m) => m.status === 'Released').length;
  const tilt = useTilt3D({ max: 5 });

  return (
    <Link
      ref={tilt.ref}
      onMouseMove={tilt.onMouseMove}
      onMouseLeave={tilt.onMouseLeave}
      to={`/deals/${deal.id}`}
      className={`glass glow-border block rounded-2xl p-5 ${tilt.className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-100">{deal.cropType || 'Supply deal'} — {deal.quantity || ''}</p>
          <p className="text-sm text-slate-500 mt-0.5">
            {roles.map((r) => ROLE_LABELS[r]).join(' & ')} · Deal #{deal.id}
          </p>
        </div>
        <DealStatusBadge status={deal.status} />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div>
          <p className="text-xs text-slate-500 uppercase tracking-wide">Total value</p>
          <p className="text-lg font-semibold gradient-text">{formatNaira(deal.totalAmount)}</p>
        </div>
        <p className="text-sm text-slate-500">
          {releasedCount} of {deal.milestones.length} milestones paid
        </p>
      </div>
    </Link>
  );
}
