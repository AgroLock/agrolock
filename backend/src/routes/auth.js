import { Router } from 'express';
import { StrKey } from '@stellar/stellar-sdk';
import { issueToken } from '../auth.js';

export const authRouter = Router();

authRouter.post('/connect', (req, res) => {
  const { address } = req.body || {};
  if (!address || !StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'A valid Stellar public key ("address") is required' });
  }
  const token = issueToken(address);
  res.json({ token, address });
});
