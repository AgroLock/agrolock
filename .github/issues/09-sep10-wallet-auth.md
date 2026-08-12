# [Backend] Cryptographic SEP-10 Challenge-Response Wallet Authentication

**Repository:** `AgroLock/agrolock`  
**Labels:** `security`, `backend`, `auth`, `high`

---

## Description

Currently, `POST /auth/connect` in `backend/src/routes/auth.js` accepts any arbitrary Stellar public key (`address`) and immediately issues a signed JWT token without verifying private key ownership via a cryptographic signature challenge.

## Proposed Resolution

Implement cryptographic challenge-response authentication in `backend/src/routes/auth.js`:
1. `GET /auth/challenge?address=G...` returns a signed challenge payload (server nonce + timestamp).
2. `POST /auth/verify` validates the Ed25519 signature of the public key using Stellar SDK `Keypair` / `StrKey` before issuing the JWT token.
