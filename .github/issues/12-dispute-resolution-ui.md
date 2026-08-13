# [Frontend] Add interactive dispute resolution voting interface in DealDetail

**Repository:** `AgroLock/agrolock`  
**Labels:** `frontend`, `ui`, `feature`, `medium`

---

## Description

Now that the smart contract supports `resolve_dispute` allowing quorum voting on disputed milestones (either release to farmer or refund to buyer), the web UI needs to expose interactive controls for authorized signers when a milestone is in `Disputed` state.

## Proposed Resolution

1. Update `frontend/src/components/MilestoneTimeline.jsx` to display interactive dispute resolution action buttons when `milestone.status === 'Disputed'`:
   - 🟢 **"Vote to Release to Farmer"**
   - 🔴 **"Vote to Refund to Buyer"**
2. Display vote tallies for both options (e.g. `Release votes: 1/2 · Refund votes: 0/2`).
3. Wire up actions to `api.resolveDispute(deal.id, milestone.id, releaseToFarmer)`.
