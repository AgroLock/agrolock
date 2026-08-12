import jwt from 'jsonwebtoken';
import { randomBytes } from 'node:crypto';
import { Keypair } from '@stellar/stellar-sdk';
import { config } from './config.js';

const challengeStore = new Map();

export function generateChallenge(address) {
  const nonce = randomBytes(32).toString('hex');
  const timestamp = Date.now();
  const challenge = `AgroLock Auth Challenge: ${nonce}:${timestamp}`;
  challengeStore.set(address, { challenge, timestamp });
  return challenge;
}

export function verifyChallenge(address, signatureBase64) {
  const stored = challengeStore.get(address);
  if (!stored) throw new Error('No active challenge for this address');
  if (Date.now() - stored.timestamp > 300000) { // 5 min TTL
    challengeStore.delete(address);
    throw new Error('Challenge expired');
  }

  const keypair = Keypair.fromPublicKey(address);
  const isValid = keypair.verify(Buffer.from(stored.challenge), Buffer.from(signatureBase64, 'base64'));
  challengeStore.delete(address);
  return isValid;
}

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
