import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { StrKey } from '@stellar/stellar-sdk';
import { useWallet } from '../context/WalletContext';
import { signWithFreighter } from '../lib/freighter';
import { api } from '../lib/api';
import { nairaToBaseUnits, formatNaira } from '../lib/currency';

const emptyMilestone = (description) => ({ description, naira: '' });

export default function CreateDeal() {
  const { address } = useWallet();
  const navigate = useNavigate();

  const [farmer, setFarmer] = useState('');
  const [attestor, setAttestor] = useState('');
  const [cropType, setCropType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('');
  const [milestones, setMilestones] = useState([
    emptyMilestone('planting'),
    emptyMilestone('mid-season growth'),
    emptyMilestone('delivery'),
  ]);
  const [quorum, setQuorum] = useState(2);
  const [submitting, setSubmitting] = useState(false);
  const [step, setStep] = useState(null);
  const [error, setError] = useState(null);

  const total = milestones.reduce((sum, m) => sum + (Number(m.naira) || 0), 0);

  function updateMilestone(i, field, value) {
    setMilestones((prev) => prev.map((m, idx) => (idx === i ? { ...m, [field]: value } : m)));
  }

  function addMilestone() {
    setMilestones((prev) => [...prev, emptyMilestone('')]);
  }

  function removeMilestone(i) {
    setMilestones((prev) => prev.filter((_, idx) => idx !== i));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (!StrKey.isValidEd25519PublicKey(farmer) || !StrKey.isValidEd25519PublicKey(attestor)) {
      setError('Farmer and attestor must be valid Stellar addresses (starting with G).');
      return;
    }
    if (milestones.some((m) => !m.description || !m.naira || Number(m.naira) <= 0)) {
      setError('Every milestone needs a description and an amount greater than 0.');
      return;
    }

    setSubmitting(true);
    try {
      setStep('Building the deal…');
      const { draftId, unsignedXdr } = await api.createDealDraft({
        farmer,
        attestor,
        cropType,
        quantity,
        deliveryDate,
        quorum: Number(quorum),
        milestones: milestones.map((m) => ({ description: m.description, amount: nairaToBaseUnits(m.naira) })),
      });

      setStep('Waiting for your signature in Freighter…');
      const signedXdr = await signWithFreighter(unsignedXdr, address);

      setStep('Creating the deal on Stellar Testnet…');
      const { escrowId } = await api.submitDraft(draftId, signedXdr);

      navigate(`/deals/${escrowId}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
      setStep(null);
    }
  }

  const inputClass =
    'w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:border-brand-400/50 focus:outline-none focus:ring-1 focus:ring-brand-400/50';

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-xl font-semibold text-slate-100 mb-1">Start a new deal</h1>
      <p className="text-sm text-slate-500 mb-6">
        You're creating this as the buyer. Funds you commit stay locked in escrow until milestones are confirmed.
      </p>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-slate-200">Deal parties</h2>
          <div>
            <label className="text-sm text-slate-400">Farmer's wallet address</label>
            <input className={inputClass} value={farmer} onChange={(e) => setFarmer(e.target.value)} placeholder="G..." />
          </div>
          <div>
            <label className="text-sm text-slate-400">Attestor's wallet address (cooperative officer / extension worker)</label>
            <input className={inputClass} value={attestor} onChange={(e) => setAttestor(e.target.value)} placeholder="G..." />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <h2 className="font-medium text-slate-200">Crop details</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400">Crop type</label>
              <input className={inputClass} value={cropType} onChange={(e) => setCropType(e.target.value)} placeholder="Maize" />
            </div>
            <div>
              <label className="text-sm text-slate-400">Quantity</label>
              <input className={inputClass} value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="5 tonnes" />
            </div>
          </div>
          <div>
            <label className="text-sm text-slate-400">Expected delivery date</label>
            <input
              type="date"
              className={inputClass}
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
            />
          </div>
        </div>

        <div className="glass rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-medium text-slate-200">Milestone schedule</h2>
            <button type="button" onClick={addMilestone} className="text-sm text-brand-300 hover:underline">
              + Add milestone
            </button>
          </div>
          {milestones.map((m, i) => (
            <div key={i} className="flex gap-3 items-start">
              <input
                className={inputClass}
                placeholder="e.g. mid-season growth"
                value={m.description}
                onChange={(e) => updateMilestone(i, 'description', e.target.value)}
              />
              <input
                className={`${inputClass} w-40`}
                placeholder="₦ amount"
                type="number"
                min="0"
                value={m.naira}
                onChange={(e) => updateMilestone(i, 'naira', e.target.value)}
              />
              {milestones.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeMilestone(i)}
                  className="text-slate-500 hover:text-rose-400 px-2 py-2"
                  aria-label="Remove milestone"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <p className="text-sm text-slate-500">
            Total deal value: <span className="font-semibold gradient-text">{formatNaira(nairaToBaseUnits(total))}</span>
          </p>
          <div>
            <label className="text-sm text-slate-400">Signatures required to release each milestone (of 3 parties)</label>
            <select className={inputClass} value={quorum} onChange={(e) => setQuorum(e.target.value)}>
              <option value={2}>2 of 3 (recommended)</option>
              <option value={3}>All 3</option>
              <option value={1}>Any 1</option>
            </select>
          </div>
        </div>

        {error && <p className="text-sm text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="w-full rounded-xl bg-gradient-to-r from-brand-400 to-brand-600 px-4 py-3 font-semibold text-ink-950 hover:brightness-110 transition disabled:opacity-60 shadow-[0_0_30px_rgba(52,211,153,0.25)]"
        >
          {submitting ? step || 'Working…' : 'Create deal'}
        </button>
      </form>
    </div>
  );
}
