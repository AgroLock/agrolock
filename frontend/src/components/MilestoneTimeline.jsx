import { MilestoneStatusBadge } from './StatusBadge';
import TxButton from './TxButton';
import { formatNaira } from '../lib/currency';
import { api } from '../lib/api';

const buttonClass =
  'inline-flex items-center rounded-lg px-3 py-1.5 text-sm font-medium transition';
const primaryButton = `${buttonClass} bg-gradient-to-r from-brand-400 to-brand-600 text-ink-950 hover:brightness-110`;
const dangerButton = `${buttonClass} bg-transparent text-rose-300 border border-rose-500/30 hover:bg-rose-500/10`;

export default function MilestoneTimeline({ deal, address, roles, onDone, onError }) {
  const canAct = deal.status === 'Funded' && roles.length > 0;

  return (
    <ol className="space-y-4">
      {deal.milestones.map((m) => {
        const hasReleaseVoted = m.releaseVotes.includes(address);
        const hasRefundVoted = m.refundVotes.includes(address);
        const quorumMet = m.releaseVotes.length >= deal.quorum;

        return (
          <li key={m.index} className="glass rounded-2xl p-5">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Milestone {m.index + 1}</p>
                <p className="font-semibold capitalize text-slate-100">{m.description}</p>
                <p className="text-sm text-slate-500 mt-0.5">{formatNaira(m.amount)}</p>
              </div>
              <MilestoneStatusBadge status={m.status} />
            </div>

            {m.status === 'Pending' && (
              <p className="text-xs text-slate-500 mt-3">
                {m.releaseVotes.length} of {deal.quorum} confirmations collected
              </p>
            )}
            {m.status === 'Disputed' && (
              <p className="text-xs text-slate-500 mt-3">
                Disputed milestone — {m.releaseVotes.length} votes to release to farmer · {m.refundVotes.length} votes to refund buyer ({deal.quorum} needed)
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

            {canAct && m.status === 'Disputed' && (
              <div className="mt-4 flex flex-wrap gap-2">
                {!hasReleaseVoted && (
                  <TxButton
                    className={primaryButton}
                    build={() => api.resolveDispute(deal.id, m.index, true)}
                    onSuccess={onDone}
                    onError={onError}
                  >
                    Vote to release to farmer
                  </TxButton>
                )}
                {!hasRefundVoted && (
                  <TxButton
                    className={dangerButton}
                    build={() => api.resolveDispute(deal.id, m.index, false)}
                    onSuccess={onDone}
                    onError={onError}
                  >
                    Vote to refund the buyer
                  </TxButton>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}
