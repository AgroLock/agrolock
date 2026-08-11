# AgroLock

Milestone-based escrow financing for Nigerian smallholder farmers, built on Stellar & Soroban.

**Live demo:** https://vicsygold.github.io/agrolock/
**Backend API:** https://agrolock.onrender.com (free tier — the first request after a few minutes idle can take ~30-60s to wake up)

## The problem

Smallholder farmers need cash upfront for seed, fertilizer, and labour, but have no
collateral or credit history, so formal lending is unavailable or prohibitively
expensive. Buyers and off-takers would often pay in advance to lock in supply, but have
no reliable way to confirm a farmer will actually plant, tend, and deliver. The result is
a standoff: capital that wants to reach farmers has no trusted mechanism to release
conditionally, on terms both sides can verify.

## The solution

A buyer and farmer agree on a supply deal (crop, quantity, price, milestone schedule).
The buyer's funds go into a Soroban smart contract instead of the farmer's pocket or a
middleman's. Funds release to the farmer in tranches as milestones are confirmed — e.g.
30% at planting, 30% at mid-season growth, 40% at delivery — and every release requires
a 2-of-3 signature quorum from the **buyer**, the **farmer**, and a neutral **attestor**
(a local cooperative officer or extension worker who verifies real-world progress). If a
milestone isn't met, the same quorum can vote to refund that tranche to the buyer instead
— no all-or-nothing loss for either side.

This MVP deliberately uses a trusted-attestor signature model rather than a
satellite/IoT oracle (out of scope/budget for an MVP) — see `contracts/agrolock/src/lib.rs`
for the reasoning and the `TODO (Phase 4, post-MVP)` marking where sensor-based
verification would plug in later.

## Architecture

```
contracts/agrolock/   Soroban escrow contract (Rust) — the source of truth for deal state
backend/               Express API that wraps Soroban calls (build tx / read state) + a
                        small JSON store for off-chain metadata (crop, quantity, dates)
frontend/              React + Tailwind app, wallet connect via Freighter
scripts/               Testnet setup/deploy/demo scripts (bash, stellar-cli)
```

The frontend never talks to the chain directly for writes: it asks the backend to build
an unsigned transaction, signs it locally in Freighter (the user's own keys never leave
their browser), and posts the signed transaction back for submission. Reads go through
the backend too, so the frontend only ever talks JSON.

Amounts are shown in Naira (₦) everywhere in the UI. Under the hood, settlement uses a
demo Stellar Asset Contract token (`NGNT`) with 7-decimal precision, standing in for a
real Naira-pegged stablecoin issued through a Stellar anchor — see "Why Naira but a
token?" below.

## Live on Stellar Testnet

| Contract | ID |
|---|---|
| AgroLock escrow | `CCJL3R2YW6QRAOD2WOWYPQ5IJPC4YDTAGGPH6LHVXA2SD44FYAQIIU2B` |
| NGNT demo token | `CC6NI3W4IVWTVUDAGACW6QLOJHD3RA346FOKTSSFKVSU27N63NWKAOWP` |

16 seeded demo deals already exist on-chain in different states — completed, awaiting
funding, funded, mid-milestone, a fresh unresolved dispute, a fully-refunded deal, and
non-default quorums (unanimous 3-of-3, any-1-of-3) and milestone counts (2 and 4-step
schedules). See **Test wallets** below to browse them without creating your own.

## Test wallets

Paste any of these into the app's "view read-only with a wallet address" option (no
Freighter needed) to browse real seeded state, or import a secret key into Freighter on
desktop (`stellar keys secret <name>` after running `setup-identities.sh`) to actually
sign as that party.

| Wallet | Address | What it shows |
|---|---|---|
| `buyer` | `GCQE3NLO3XTSESTBDOCT5WIQSJ5AT3DT3XAKFX75MSAHEPHED2HF5O2I` | 10 deals — Maize, Cassava, Sorghum, Rice, Yam, Plantain, Ginger, Tomato (quorum 3), Soybean (4 milestones), Cotton |
| `buyer2` | `GCENWSTWI7CIL2S5IXKXEQBSZTP5E5FJQMVNVQEGTFLYW5PNCYU2ZRZW` | 6 deals — Cocoa, Groundnut, Beans (disputed), Sesame (quorum 1), Hibiscus/Zobo (fully refunded), Cashew |
| `farmer` | `GDGVBHF3TYH5XKEDETRH2KM2WPUNLFC2OIJSK4QHA6QSUCWNVMHEKCF7` | Farmer on most `buyer`/`buyer2` deals — same data, farmer's-eye view |
| `attestor` | `GA3TF7V6JNOUPN2PHA7WM2CWZNQFWFXGHEFNV5KHQWGOEUXT2GVG2C4R` | Attestor role across several deals |
| `emptytest` | `GDU4AGPKOUXFFPOO632UNDM5K7YCNALUIXBLEJ4433DSX26KC3S5WZXG` | Party to **zero** deals — for testing the empty-dashboard state |

## How the contract works

`contracts/agrolock/src/lib.rs` — one contract, six mutating entry points:

- **`create_escrow`** — buyer defines farmer, attestor, token, milestone descriptions +
  amounts (must sum to `total_amount`), and the signature quorum (2-of-3 recommended).
  Only creates the record; no funds move yet.
- **`fund_escrow`** — buyer transfers `total_amount` of the token into the contract.
- **`confirm_milestone`** — any of the 3 parties signs off that a milestone happened.
  Votes are deduplicated per address.
- **`release_tranche`** — once a milestone has `quorum` confirmations, pays that
  tranche to the farmer. Callable by anyone once the threshold is met — the contract
  itself, not the caller, authorizes the transfer, since it's releasing funds it
  already escrowed under its own address.
- **`dispute`** — any party flags a still-pending milestone as disputed, freezing
  `confirm_milestone` / `release_tranche` for it.
- **`refund`** — any party votes to refund a *disputed* milestone's tranche back to the
  buyer; once `quorum` refund-votes are collected, the tranche returns to the buyer.

Two read-only views, `get_escrow` and `get_milestone`, back everything the frontend
displays. 6 unit tests in `contracts/agrolock/src/test.rs` cover the happy path, quorum
enforcement, the dispute→refund path, non-party rejection, duplicate-vote rejection, and
milestone-sum validation.

## Running it locally

### Prerequisites

- Rust + `wasm32v1-none` target (`rustup target add wasm32v1-none`)
- [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli) (`cargo install --locked stellar-cli`)
- Node.js 20+

### 1. Contract (already deployed — only needed if you want to redeploy)

```bash
bash scripts/setup-identities.sh   # creates & funds deployer/buyer/farmer/attestor on testnet
bash scripts/deploy.sh             # builds + deploys agrolock + a demo NGNT token
bash scripts/interact.sh           # optional: exercises the full happy path via CLI
```

`deploy.sh` writes the resulting contract IDs to `.deployed/testnet.json`.

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env        # already points at the deployed contract IDs above
npm run seed                # optional: (re)populate the 4 demo deals
npm start                   # http://localhost:4000
```

### 3. Frontend

```bash
cd frontend
npm install
npm run dev                 # http://localhost:5173
```

You'll need the [Freighter](https://www.freighter.app/) browser extension, set to
**Testnet**, with one or more of the demo identities imported (get their secret keys
with `stellar keys secret buyer` / `farmer` / `attestor` / `deployer` after running
`setup-identities.sh`).

## Demo script (~3 minutes)

1. **Open the app, connect Freighter as Buyer.** The dashboard shows the seeded
   deals — completed, awaiting funding, mid-milestone, and disputed among them —
   proving this is real state on a public testnet, not a mock.
2. **Open the mid-milestone deal (Sorghum, #3).** Milestone 1 (planting) already shows
   "Payment released." Milestone 2 shows "1 of 2 confirmations collected" — the
   attestor already signed off.
3. **Switch Freighter to the Farmer account**, click "Confirm this milestone happened"
   on Milestone 2, approve in the Freighter popup. Quorum is now met.
4. **Click "Release payment to farmer."** Approve in Freighter — the tranche pays out
   and the milestone flips to "Payment released."
5. **Open the disputed deal (Rice, #4)** to show the safety net: a milestone flagged
   "Under review" instead of forcing an all-or-nothing loss.
6. **Switch back to Buyer, click "+ New deal."** Fill in a farmer/attestor address, a
   crop, and one milestone; submit and sign in Freighter — a brand new escrow appears
   on-chain in real time, "Awaiting funding."
7. **Click "Fund this deal,"** sign, and watch it flip to "In progress" — the full
   loop, live, in front of the judges.

## Why Naira displayed but a token underneath?

The pitch is Naira in, Naira out, with the trust and escrow logic running on-chain in
the middle — buyers and farmers should never need to think in crypto. In production,
that's a Stellar anchor doing Naira↔stablecoin conversion on both ends. For this
testnet MVP, we deploy a demo Stellar Asset Contract (`NGNT`) as a stand-in for that
anchor-issued asset, and the UI shows only Naira amounts throughout — see
`frontend/src/lib/currency.js`.

## Known simplifications (by design, for an MVP)

- **Trusted-attestor verification**, not a satellite/IoT oracle — flagged as a Phase 4
  TODO in the contract source.
- **Wallet-address auth**: connecting a Freighter wallet is the login event (no
  password) — see the `TODO` in `backend/src/auth.js` about verifying a signed
  challenge before this goes anywhere near production.
- **JSON-file metadata store** in the backend (`backend/data/deals.json`) instead of a
  real database — fine for a demo, not for production.

## Security Audit & Issue Tracker

A comprehensive codebase & security audit was conducted on this project. 7 tracked issues are documented in [`.github/issues/`](.github/issues/README.md) and published on the repository issue tracker:

- 🔴 **[Issue #2](https://github.com/AgroLock/agrolock/issues/2)**: `[Contract] Asymmetric Dispute Resolution Flaw - Disputed milestones cannot be released to farmer`
- 🟠 **[Issue #3](https://github.com/AgroLock/agrolock/issues/3)**: `[Backend] Unauthenticated JWT Issuance & Metadata Impersonation`
- 🟠 **[Issue #4](https://github.com/AgroLock/agrolock/issues/4)**: `[Contract] Soroban Storage TTL Archival Risk on Long-Term Crop Cycles`
- 🟡 **[Issue #5](https://github.com/AgroLock/agrolock/issues/5)**: `[Backend] Metadata Store Flat-File Dependency & Chain Desynchronization`
- 🟡 **[Issue #6](https://github.com/AgroLock/agrolock/issues/6)**: `[Contract] Missing EscrowStatus::Funded assertion in release_tranche`
- 🟢 **[Issue #7](https://github.com/AgroLock/agrolock/issues/7)**: `[Backend] Shared Reader Public Key Sequence Bottleneck during RPC Simulation`
- 🟢 **[Issue #8](https://github.com/AgroLock/agrolock/issues/8)**: `[Frontend] Missing pre-flight token balance check before funding deal`

See [`.github/issues/README.md`](file:///c:/Users/Victor%20Ameh/OneDrive/Desktop/Agro-lock/.github/issues/README.md) for full descriptions, affected line numbers, and recommended fixes.

