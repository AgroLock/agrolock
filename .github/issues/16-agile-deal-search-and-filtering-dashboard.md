# [Frontend] Agile Deal Search, Multi-Filter Pills & Live Sorting Dashboard

**Repository:** `AgroLock/agrolock`  
**Labels:** `frontend`, `dashboard`, `agile`, `ux`, `medium`

---

## Description

As deal volume grows, finding specific escrows by status, crop type, or buyer/farmer role can become sluggish. The dashboard previously rendered all returned deals in a flat grid without client-side search, status filter pills, sorting options, or aggregate metrics.

## Proposed Resolution

1. Add live search input filtering deals dynamically by crop type, escrow ID, buyer address, or farmer address.
2. Add status filter tabs (`All`, `Active`, `Funded`, `Disputed`, `Completed`).
3. Add sorting selector (`Newest First`, `Oldest First`, `Highest Amount`).
4. Display aggregate summary pills showing deal counts per category.
5. Provide responsive empty states with a quick search clear button.
