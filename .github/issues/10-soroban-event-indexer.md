# [Backend] Real-Time Soroban RPC Contract Event Listener & Indexer

**Repository:** `AgroLock/agrolock`  
**Labels:** `backend`, `indexer`, `feature`, `enhancement`

---

## Description

Currently, the backend Express API does not automatically index or learn about contract state changes executed outside the frontend (e.g. via Stellar CLI or third-party callers).

## Proposed Resolution

Implement a background Soroban event indexer service in `backend/src/eventListener.js`:
- Polls Soroban RPC for published contract events emitted by `AGROLOCK_CONTRACT_ID`.
- Listens for `created`, `funded`, `confirm`, `released`, `disputed`, and `refunded` events.
- Automatically syncs and updates off-chain deal records in `backend/src/store.js`.
