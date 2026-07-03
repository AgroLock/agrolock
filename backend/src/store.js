// Off-chain metadata the contract itself doesn't store (crop type, quantity,
// price, delivery date) plus a small draft table used while a create_escrow
// transaction is in flight. Backed by a JSON file — fine for an MVP demo;
// a real deployment would use a proper database.
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'deals.json');

function load() {
  if (!existsSync(DATA_FILE)) return { deals: {}, drafts: {} };
  return JSON.parse(readFileSync(DATA_FILE, 'utf-8'));
}

let db = load();

function persist() {
  if (!existsSync(DATA_DIR)) mkdirSync(DATA_DIR, { recursive: true });
  writeFileSync(DATA_FILE, JSON.stringify(db, null, 2));
}

export function saveDraft(draftId, metadata) {
  db.drafts[draftId] = { ...metadata, createdAt: new Date().toISOString() };
  persist();
}

export function getDraft(draftId) {
  return db.drafts[draftId];
}

export function resolveDraft(draftId, escrowId) {
  const draft = db.drafts[draftId];
  if (!draft) return;
  db.deals[escrowId] = { ...draft, escrowId };
  delete db.drafts[draftId];
  persist();
}

export function saveDealMetadata(escrowId, metadata) {
  db.deals[escrowId] = { ...(db.deals[escrowId] || {}), ...metadata, escrowId };
  persist();
}

export function getDealMetadata(escrowId) {
  return db.deals[escrowId];
}

export function listDealMetadata() {
  return Object.values(db.deals);
}

export function allEscrowIds() {
  return Object.keys(db.deals);
}
