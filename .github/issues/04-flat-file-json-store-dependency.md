# [Backend] Metadata Store Flat-File Dependency & Chain Desynchronization

**Repository:** `Vicsygold/agrolock`  
**Labels:** `backend`, `database`, `architecture`, `medium`

---

## Description

Off-chain deal metadata (crop type, delivery date, quantities, pricing) is stored in a flat JSON file `backend/data/deals.json`. The `GET /deals` endpoint enumerates escrow IDs strictly from this file.

## Vulnerability & Impact

1. **Data Loss:** On cloud hosts with ephemeral filesystems (e.g. Render free tier, Heroku, Vercel container restarts), `deals.json` is wiped out, permanently losing off-chain deal metadata.
2. **Chain Desync:** Escrows created directly on-chain or via CLI scripts are ignored by the backend because their IDs do not exist in `deals.json`.
3. **Concurrency:** Synchronous `writeFileSync` calls risk file corruption under parallel write traffic.

## Affected Code

- [`backend/src/store.js`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/backend/src/store.js)
- [`backend/src/routes/deals.js`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/backend/src/routes/deals.js#L35-L47)

## Suggested Fix

1. Migrate from `deals.json` to SQLite or PostgreSQL (using Prisma or Knex).
2. Build an event indexer that listens for Soroban contract events (`create_escrow`) and syncs on-chain escrows into the backend database automatically.
