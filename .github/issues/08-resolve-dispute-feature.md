# [Contract] Implement resolve_dispute entrypoint for quorum release or refund

**Repository:** `AgroLock/agrolock`  
**Labels:** `smart-contract`, `security`, `feature`, `critical`

---

## Description

Currently, disputing a milestone in `contracts/agrolock/src/lib.rs` freezes `confirm_milestone` and `release_tranche`. The contract previously only supported `refund(...)`, which transferred tranche funds back to the buyer. 

If a buyer filed a dispute (even frivolously), even if 2-of-3 signers (Attestor + Farmer) agreed that the farmer delivered, the contract had no on-chain mechanism to pay the farmer.

## Proposed Resolution

Add a `resolve_dispute` entrypoint in `lib.rs`:
- Allows any party to vote to resolve a disputed milestone either **in favor of the farmer** (`release`) or **in favor of the buyer** (`refund`).
- Once `quorum` votes are collected for either release or refund, the contract transfers the tranche funds to the respective party and marks the milestone as `Released` or `Refunded`.
