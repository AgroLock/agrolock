# [Backend] Unauthenticated JWT Issuance & Off-Chain Metadata Impersonation

**Repository:** `Vicsygold/agrolock`  
**Labels:** `security`, `backend`, `auth`, `high`

---

## Description

In `backend/src/routes/auth.js`, the `/auth/connect` endpoint accepts any arbitrary Stellar public key (`address`) and immediately issues a signed JWT token without verifying private key ownership via a cryptographic signature challenge.

## Vulnerability & Impact

An unauthenticated actor can pass any user's public key (e.g., `GCQE3N...`) to `/auth/connect` and use the resulting JWT to query `GET /deals`. This exposes all private off-chain metadata (crop types, quantities, target pricing, delivery dates) for deals associated with that address.

## Affected Code

- [`backend/src/routes/auth.js`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/backend/src/routes/auth.js#L7-L15)

```javascript
authRouter.post('/connect', (req, res) => {
  const { address } = req.body || {};
  if (!address || !StrKey.isValidEd25519PublicKey(address)) {
    return res.status(400).json({ error: 'A valid Stellar public key ("address") is required' });
  }
  const token = issueToken(address); // <--- Issued without cryptographic proof
  res.json({ token, address });
});
```

## Suggested Fix

Implement SEP-10 / SIP-10 wallet challenge-response authentication:
1. `GET /auth/challenge?address=...` generates a random nonce.
2. Client signs the challenge nonce in Freighter.
3. `POST /auth/verify` validates the Ed25519 signature server-side before issuing the JWT.
