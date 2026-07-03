import { MilestoneStatusBadge } from './StatusBadge';
import TxButton from './TxButton';
import { formatNaira } from '../lib/currency';
import { api } from '../lib/api';

const buttonClass =
  'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition';
const primaryButton = `${buttonClass} bg-brand-700 text-white hover:bg-brand-600`;
const dangerButton = `${buttonClass} bg-white text-rose-600 border border-rose-200 hover:bg-rose-50`;

export default function MilestoneTimeline({ deal, address, roles, onDone, onError }) {
  const canAct = deal.status === 'Funded' && roles.length > 0;

  return (
    <ol className="space-y-4">
      {deal.milestones.map((m) => {
        const hasReleaseVoted = m.releaseVotes.includes(address);
        const hasRefundVoted = m.refundVotes.includes(address);
        const quorumMet = m.releaseVotes.length >= deal.quorum;

        return (
          <li key={m.index} className="rounded-xl border border-brand-100 bg-white p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-slate-400 uppercase tracking-wide">Milestone {m.index + 1}</p>
                <p className="font-semibold capitalize text-brand-900">{m.description}</p>
                <p className="text-sm text-slate-500 mt-0.5">{formatNaira(m.amount)}</p>
              </div>
              <MilestoneStatusBadge status={m.status} />
            </div>

            {m.status === 'Pending' && (
              <p className="text-xs text-slate-400 mt-3">
                {m.releaseVotes.length} of {deal.quorum} confirmations collected
              </p>
            )}
            {m.status === 'Disputed' && (
              <p className="text-xs text-slate-400 mt-3">
                {m.refundVotes.length} of {deal.quorum} votes to refund the buyer
              </p>
            )}

            {canAct && m.status === 'Pending' && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!hasReleaseVoted && (
                  <TxButton
                    className={primaryButton}
                    build={() => api.confirmMilestone(deal.id, m.index)}
                    onSuccess={onDone}
                    onError={onError}
                  >
                    Confirm this milestone happened
                  </TxButton>
                )}
                {quorumMet && (
                  <TxButton
                    className={primaryButton}
                    build={() => api.releaseTranche(deal.id, m.index)}
                    onSuccess={onDone}
                    onError={onError}
                  >
                    Release payment to farmer
                  </TxButton>
                )}
                <TxButton
                  className={dangerButton}
                  build={() => api.dispute(deal.id, m.index)}
                  onSuccess={onDone}
                  onError={onError}
                >
                  Report a problem
                </TxButton>
              </div>
            )}

            {canAct && m.status === 'Disputed' && !hasRefundVoted && (
              <div className="mt-4">
                <TxButton
                  className={dangerButton}
                  build={() => api.refund(deal.id, m.index)}
                  onSuccess={onDone}
                  onError={onError}
                >
                  Vote to refund the buyer
                </TxButton>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
