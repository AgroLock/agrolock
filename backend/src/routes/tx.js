import { Router } from 'express';
import { requireAuth } from '../auth.js';
import { submitSignedTx } from '../sorobanClient.js';

export const txRouter = Router();
txRouter.use(requireAuth);

// Generic submission endpoint for any action that doesn't need special
// post-processing (fund/confirm/release/dispute/refund). Deal *creation*
// has its own submit route (POST /deals/drafts/:draftId/submit) because it
// needs to resolve the local metadata draft to the real on-chain escrow id.
txRouter.post('/submit', async (req, res) => {
  const { signedXdr } = req.body || {};
  if (!signedXdr) return res.status(400).json({ error: 'signedXdr is required' });
  try {
    const result = await submitSignedTx(signedXdr);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});
