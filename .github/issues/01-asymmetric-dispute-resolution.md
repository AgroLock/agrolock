# [Contract] Asymmetric Dispute Resolution Flaw - Disputed milestones cannot be released to farmer

**Repository:** `Vicsygold/agrolock`  
**Labels:** `bug`, `smart-contract`, `security`, `critical`

---

## Description

In `contracts/agrolock/src/lib.rs`, any party (buyer, farmer, or attestor) can call `dispute(escrow_id, milestone_id)` on a pending milestone. Once marked `Disputed`, the **only** supported state transition in the smart contract is `refund(...)`, which transfers the tranche funds back to the `buyer`.

## Vulnerability & Impact

There is no `resolve_dispute` function allowing the 2-of-3 quorum to vote to release funds to the `farmer`. 

- If a buyer files a dispute (even frivolously), even if the Attestor and Farmer agree that the milestone was completed, the contract **cannot pay the farmer**. 
- The funds remain locked in the contract indefinitely unless the buyer receives a full refund.
- **Front-running risk:** A buyer can wait until the farmer and attestor sign `confirm_milestone` and then call `dispute` before `release_tranche` is executed, freezing the release permanently.

## Affected Code

- [`contracts/agrolock/src/lib.rs`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/contracts/agrolock/src/lib.rs#L230-L276)

```rust
pub fn dispute(env: Env, escrow_id: u64, milestone_id: u32, signer: Address) -> Result<(), Error> {
    // ... sets milestone.status = MilestoneStatus::Disputed
}

pub fn refund(env: Env, escrow_id: u64, milestone_id: u32, signer: Address) -> Result<u32, Error> {
    // ... requires status == Disputed, pays BUYER when quorum reached
}
```

## Suggested Fix

1. Add a `resolve_dispute` entrypoint in `lib.rs` that allows the 2-of-3 quorum to vote on whether a disputed milestone should be **released to the farmer** or **refunded to the buyer**.
2. Add unit tests covering dispute resolution in both directions.
