const DEAL_STATUS = {
  Created: { label: 'Awaiting funding', className: 'bg-amber-100 text-amber-800' },
  Funded: { label: 'In progress', className: 'bg-brand-100 text-brand-700' },
  Completed: { label: 'Completed', className: 'bg-brand-600 text-white' },
};

const MILESTONE_STATUS = {
  Pending: { label: 'Waiting for confirmation', className: 'bg-slate-100 text-slate-600' },
  Released: { label: 'Payment released', className: 'bg-brand-600 text-white' },
  Disputed: { label: 'Under review', className: 'bg-rose-100 text-rose-700' },
  Refunded: { label: 'Refunded to buyer', className: 'bg-slate-200 text-slate-700' },
};

export function DealStatusBadge({ status }) {
  const meta = DEAL_STATUS[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return <span className={`status-pill ${meta.className}`}>{meta.label}</span>;
}

export function MilestoneStatusBadge({ status }) {
  const meta = MILESTONE_STATUS[status] || { label: status, className: 'bg-slate-100 text-slate-600' };
  return <span className={`status-pill ${meta.className}`}>{meta.label}</span>;
}
