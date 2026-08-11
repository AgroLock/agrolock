# [Contract] Soroban Persistent Storage Data Archival Risk on Long-Term Crop Cycles

**Repository:** `Vicsygold/agrolock`  
**Labels:** `smart-contract`, `storage`, `enhancement`, `high`

---

## Description

In `contracts/agrolock/src/lib.rs`, `save()` bumps the persistent storage TTL of `DataKey::Escrow(escrow_id)` by ~30 days (`BUMP_AMOUNT = 17280 * 30`).

## Vulnerability & Impact

Nigerian agricultural growing cycles (Yam, Cassava, Cocoa, Oil Palm) often span 4 to 9 months. If no milestone updates occur for >30 days, the Soroban ledger entry will expire and archive on-chain. Read calls (`load`) currently do not extend TTL, causing subsequent milestone interactions to fail with `Error::NotFound` until manually restored.

## Affected Code

- [`contracts/agrolock/src/lib.rs`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/contracts/agrolock/src/lib.rs#L89-L91)
- [`contracts/agrolock/src/lib.rs`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/contracts/agrolock/src/lib.rs#L299-L308)

```rust
const DAY_LEDGERS: u32 = 17280;
const BUMP_AMOUNT: u32 = DAY_LEDGERS * 30; // 30 days
```

## Suggested Fix

1. Automatically extend persistent storage TTL on reads inside `load(&env, escrow_id)`.
2. Increase `BUMP_AMOUNT` default to 180+ days (~6 months) to match realistic farming seasons.
