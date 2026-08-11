# [Contract] Missing EscrowStatus::Funded assertion in release_tranche

**Repository:** `Vicsygold/agrolock`  
**Labels:** `smart-contract`, `bug`, `medium`

---

## Description

`release_tranche` checks `m.status == MilestoneStatus::Pending` and `release_votes.len() >= escrow.quorum`, but does not assert `escrow.status == EscrowStatus::Funded`.

## Vulnerability & Impact

Calling `release_tranche` on an unfunded escrow (`Created` state) fails with an unhandled Soroban token contract error during transfer rather than returning a clean contract error `Error::NotFunded`.

## Affected Code

- [`contracts/agrolock/src/lib.rs`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/contracts/agrolock/src/lib.rs#L205-L225)

```rust
pub fn release_tranche(env: Env, escrow_id: u64, milestone_id: u32) -> Result<(), Error> {
    let mut escrow = Self::load(&env, escrow_id)?;
    let mut m = escrow.milestones.get(milestone_id).ok_or(Error::InvalidMilestoneId)?;
    if m.status != MilestoneStatus::Pending {
        return Err(Error::MilestoneNotPending);
    }
    // MISSING: if escrow.status != EscrowStatus::Funded { return Err(Error::NotFunded); }
    if m.release_votes.len() < escrow.quorum {
        return Err(Error::QuorumNotMet);
    }
```

## Suggested Fix

Explicitly validate `if escrow.status != EscrowStatus::Funded { return Err(Error::NotFunded); }` at the start of `release_tranche`.
