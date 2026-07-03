import { Router } from 'express';
import { randomUUID } from 'node:crypto';
import { requireAuth } from '../auth.js';
import {
  buildCreateEscrowTx,
  buildFundEscrowTx,
  buildConfirmMilestoneTx,
  buildReleaseTrancheTx,
  buildDisputeTx,
  buildRefundTx,
  getEscrowOnChain,
  submitSignedTx,
} from '../sorobanClient.js';
import { normalizeEscrow } from '../serialize.js';
import { saveDraft, getDraft, resolveDraft, saveDealMetadata, getDealMetadata, listDealMetadata } from '../store.js';

export const dealsRouter = Router();
dealsRouter.use(requireAuth);

function isParty(address, escrow) {
  return address === escrow.buyer || address === escrow.farmer || address === escrow.attestor;
}

async function loadDeal(escrowId) {
  const onChain = await getEscrowOnChain(escrowId);
  const escrow = normalizeEscrow(onChain, escrowId);
  const metadata = getDealMetadata(escrowId) || {};
  return { ...escrow, cropType: metadata.cropType, quantity: metadata.quantity, unit: metadata.unit, deliveryDate: metadata.deliveryDate };
}

// List deals where the authenticated wallet is buyer, farmer, or attestor.
// Escrow reads hit Soroban RPC over the network, so fetch them all
// concurrently rather than one at a time — with a growing demo deal count
// a sequential loop here means the wait time scales linearly with it.
dealsRouter.get('/', async (req, res) => {
  const ids = listDealMetadata().map((d) => d.escrowId);
  const results = await Promise.allSettled(ids.map((id) => loadDeal(id)));
  const deals = [];
  results.forEach((result, i) => {
    if (result.status === 'fulfilled') {
      if (isParty(req.user.address, result.value)) deals.push(result.value);
    } else {
      console.error(`failed to load escrow ${ids[i]}:`, result.reason?.message);
    }
  });
  res.json({ deals });
});

dealsRouter.get('/:id', async (req, res) => {
  try {
    const deal = await loadDeal(req.params.id);
    res.json({ deal });
  } catch (err) {
    res.status(404).json({ error: `Escrow ${req.params.id} not found: ${err.message}` });
  }
});

// Buyer starts a new deal. Returns an unsigned transaction for the buyer's
// wallet to sign; the frontend then posts the signed XDR to
// /deals/drafts/:draftId/submit to actually create it on-chain.
dealsRouter.post('/', async (req, res) => {
  const { farmer, attestor, cropType, quantity, unit, deliveryDate, milestones, quorum } = req.body || {};
  if (!farmer || !attestor || !Array.isArray(milestones) || milestones.length === 0) {
    return res.status(400).json({ error: 'farmer, attestor, and a non-empty milestones array are required' });
  }
  const milestoneDescriptions = milestones.map((m) => m.description);
  const milestoneAmounts = milestones.map((m) => String(m.amount));
  const totalAmount = milestoneAmounts.reduce((sum, a) => sum + BigInt(a), 0n).toString();

  try {
    const unsignedXdr = await buildCreateEscrowTx({
      source: req.user.address,
      buyer: req.user.address,
      farmer,
      attestor,
      totalAmount,
      milestoneDescriptions,
      milestoneAmounts,
      quorum: quorum || 2,
    });
    const draftId = randomUUID();
    saveDraft(draftId, {
      buyer: req.user.address,
      farmer,
      attestor,
      cropType,
      quantity,
      unit,
      deliveryDate,
      totalAmount,
    });
    res.json({ draftId, unsignedXdr });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

dealsRouter.get('/drafts/:draftId', (req, res) => {
  const draft = getDraft(req.params.draftId);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  res.json({ draft });
});

// Submits the buyer's signed create_escrow transaction, then resolves the
// local metadata draft to the real on-chain escrow id from the tx result.
dealsRouter.post('/drafts/:draftId/submit', async (req, res) => {
  const draft = getDraft(req.params.draftId);
  if (!draft) return res.status(404).json({ error: 'Draft not found' });
  const { signedXdr } = req.body || {};
  if (!signedXdr) return res.status(400).json({ error: 'signedXdr is required' });
  try {
    const result = await submitSignedTx(signedXdr);
    const escrowId = String(result.returnValue);
    resolveDraft(req.params.draftId, escrowId);
    res.json({ ...result, escrowId });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

function actionRoute(path, builder, { needsSigner = false } = {}) {
  dealsRouter.post(path, async (req, res) => {
    try {
      const args = { source: req.user.address, escrowId: req.params.id, milestoneId: req.params.milestoneId };
      if (needsSigner) args.signer = req.user.address;
      const unsignedXdr = await builder(args);
      res.json({ unsignedXdr });
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });
}

actionRoute('/:id/fund', buildFundEscrowTx);
actionRoute('/:id/milestones/:milestoneId/confirm', buildConfirmMilestoneTx, { needsSigner: true });
actionRoute('/:id/milestones/:milestoneId/release', buildReleaseTrancheTx);
actionRoute('/:id/milestones/:milestoneId/dispute', buildDisputeTx, { needsSigner: true });
actionRoute('/:id/milestones/:milestoneId/refund', buildRefundTx, { needsSigner: true });

export { saveDealMetadata };
