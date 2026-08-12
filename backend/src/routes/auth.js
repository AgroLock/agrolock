import { Router } from 'express';
import { StrKey } from '@stellar/stellar-sdk';
import { issueToken, generateChallenge, verifyChallenge } from '../auth.js';

export const authRouter = Router();

authRouter.get('/challenge', (req, res) => {
  const { address } = req.query || {};
  if (!address || !StrKey.isValidEd25519PublicKey(String(address))) {
    return res.status(400).json({ error: 'A valid Stellar public key ("address") is required' });
  }
  const challenge = generateChallenge(String(address));
  res.json({ address, challenge });
});

authRouter.post('/verify', (req, res) => {
  const { address, signature } = req.body || {};
  if (!address || !signature || !StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'address and signature base64 string are required' });
  }
  try {
    const isValid = verifyChallenge(address, signature);
    if (!isValid) return res.status(401).json({ error: 'Invalid challenge signature' });
    const token = issueToken(address);
    res.json({ token, address });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

authRouter.post('/connect', (req, res) => {
  const { address } = req.body || {};
  if (!address || !StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'A valid Stellar public key ("address") is required' });
  }
  const token = issueToken(address);
  res.json({ token, address });
});
