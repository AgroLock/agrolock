# [Contract] Add cancel_escrow for unfunded deals and auto-TTL storage extension

**Repository:** `AgroLock/agrolock`  
**Labels:** `smart-contract`, `feature`, `storage`, `medium`

---

## Description

Currently, if a buyer creates an escrow record (`Created` state) but decides never to fund it, the escrow entry remains on Soroban storage indefinitely with no mechanism for cancellation. Additionally, read operations do not automatically extend storage TTL for long-term seasonal crop escrows.

## Proposed Resolution

1. Implement `cancel_escrow(env, escrow_id)` in `contracts/agrolock/src/lib.rs` allowing the buyer to cancel/purge an unfunded escrow in `Created` state.
2. Extend persistent storage TTL inside `load(&env, escrow_id)` on read calls to prevent multi-month agricultural escrows from archiving unexpectedly.
3. Add unit tests in `contracts/agrolock/src/test.rs` for `cancel_escrow` and `resolve_dispute`.
