# [Frontend] Missing pre-flight token balance check before funding deal

**Repository:** `Vicsygold/agrolock`  
**Labels:** `frontend`, `ux`, `low`

---

## Description

When a buyer clicks "Fund this deal" in `DealDetail.jsx`, the frontend prompts Freighter to sign the funding transaction without verifying if the buyer holds sufficient `NGNT` token balance.

## Vulnerability & Impact

Buyers with insufficient `NGNT` balance approve transactions in Freighter that subsequently fail upon submission to the Stellar network, leading to poor UX and confusing error messages.

## Affected Code

- [`frontend/src/pages/DealDetail.jsx`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/frontend/src/pages/DealDetail.jsx)

## Suggested Fix

Query `getTokenBalance(buyerAddress)` before triggering `api.fund(...)` and display a clear UI warning if the balance is less than `totalAmount`.
