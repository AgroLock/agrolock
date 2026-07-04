const DEAL_STATUS = {
  Created: { label: 'Awaiting funding', className: 'bg-gold-400/10 text-gold-300 border border-gold-400/20' },
  Funded: { label: 'In progress', className: 'bg-brand-400/10 text-brand-300 border border-brand-400/20' },
  Completed: { label: 'Completed', className: 'bg-gradient-to-r from-brand-400 to-brand-600 text-ink-950' },
};

const MILESTONE_STATUS = {
  Pending: { label: 'Waiting for confirmation', className: 'bg-white/5 text-slate-300 border border-white/10' },
  Released: { label: 'Payment released', className: 'bg-gradient-to-r from-brand-400 to-brand-600 text-ink-950' },
  Disputed: { label: 'Under review', className: 'bg-rose-500/10 text-rose-300 border border-rose-500/20' },
  Refunded: { label: 'Refunded to buyer', className: 'bg-white/5 text-slate-400 border border-white/10' },
};

export function DealStatusBadge({ status }) {
  const meta = DEAL_STATUS[status] || { label: status, className: 'bg-white/5 text-slate-300 border border-white/10' };
  return <span className={`status-pill ${meta.className}`}>{meta.label}</span>;
}

export function MilestoneStatusBadge({ status }) {
  const meta = MILESTONE_STATUS[status] || { label: status, className: 'bg-white/5 text-slate-300 border border-white/10' };
  return <span className={`status-pill ${meta.className}`}>{meta.label}</span>;
}
