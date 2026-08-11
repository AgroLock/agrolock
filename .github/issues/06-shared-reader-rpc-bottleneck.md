# [Backend] Shared Reader Public Key Sequence Bottleneck during RPC Simulation

**Repository:** `Vicsygold/agrolock`  
**Labels:** `backend`, `performance`, `rpc`, `low`

---

## Description

In `backend/src/sorobanClient.js`, `readCall(...)` simulates contract read calls (`get_escrow`, `get_milestone`) using a single fixed account (`config.readerPublicKey`).

## Vulnerability & Impact

Under concurrent read traffic, fetching sequence numbers for the exact same reader account in parallel can cause RPC simulation sequence number collisions or rate-limiting delays.

## Affected Code

- [`backend/src/sorobanClient.js`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/backend/src/sorobanClient.js#L31-L49)

## Suggested Fix

Implement a pool of reader accounts or use ephemeral keypairs for contract read simulations.
