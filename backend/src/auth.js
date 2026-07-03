// Wallet-based "login": connecting a Freighter wallet and presenting its
// address is the authentication event, matching typical dApp UX — there's
// no password. This JWT only gates API access to *our* metadata store; it
// never authorizes fund movement. Every on-chain action still requires the
// matching Stellar keypair to sign the transaction in Freighter, which is
// the real security boundary.
//
// TODO (production hardening): require the wallet to sign a random
// challenge nonce on /auth/connect and verify that signature server-side,
// rather than trusting a bare submitted address.
import jwt from 'jsonwebtoken';
import { config } from './config.js';

export function issueToken(address) {
  return jwt.sign({ address }, config.jwtSecret, { expiresIn: '12h' });
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: 'Missing bearer token' });
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { address: payload.address };
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}
