# [Backend] Add network telemetry and indexer status health endpoint

**Repository:** `AgroLock/agrolock`  
**Labels:** `backend`, `api`, `feature`, `low`

---

## Description

The backend currently exposes `/health` which returns `{ status: "ok" }`. However, clients and frontend dApps have no quick way to inspect the current Soroban network passphrase, deployed contract IDs, RPC connectivity, and indexer ledger sync status.

## Proposed Resolution

Add a `GET /health/network` telemetry endpoint in `backend/src/server.js`:
- Queries latest ledger sequence from Soroban RPC.
- Returns RPC URL, Network Passphrase, AgroLock Contract ID, NGNT Token Contract ID, and indexer sync state.
