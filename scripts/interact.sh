#!/usr/bin/env bash
# Demonstrates the full AgroLock happy path against the deployed Testnet
# contract, purely via stellar-cli: buyer creates & funds an escrow,
# attestor + farmer confirm each milestone, tranches release to the farmer.
# Run scripts/deploy.sh first (requires .deployed/testnet.json).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
NETWORK="testnet"

AGROLOCK_ID=$(grep -o '"agrolockContractId": *"[^"]*"' "$ROOT/.deployed/testnet.json" | sed -E 's/.*"([A-Z0-9]+)"$/\1/')
TOKEN_ID=$(grep -o '"tokenContractId": *"[^"]*"' "$ROOT/.deployed/testnet.json" | sed -E 's/.*"([A-Z0-9]+)"$/\1/')

BUYER=$(stellar keys address buyer)
FARMER=$(stellar keys address farmer)
ATTESTOR=$(stellar keys address attestor)

echo "AgroLock contract: $AGROLOCK_ID"
echo "NGNT token contract: $TOKEN_ID"
echo "buyer=$BUYER farmer=$FARMER attestor=$ATTESTOR"
echo

echo "==> Establishing classic trustlines to NGNT for buyer and farmer..."
stellar tx new change-trust --source-account buyer --network "$NETWORK" --line "NGNT:$(stellar keys address deployer)" >/dev/null
stellar tx new change-trust --source-account farmer --network "$NETWORK" --line "NGNT:$(stellar keys address deployer)" >/dev/null

echo "==> Minting 1,000,000 NGNT (7-decimal token units: 10_000_000_000000) to buyer..."
stellar contract invoke --id "$TOKEN_ID" --source-account deployer --network "$NETWORK" \
  -- mint --to "$BUYER" --amount 10000000000000

echo
echo "==> Buyer creates a 3-milestone escrow for a maize supply deal (₦1,000,000 total)..."
ESCROW_ID=$(stellar contract invoke --id "$AGROLOCK_ID" --source-account buyer --network "$NETWORK" \
  -- create_escrow \
  --buyer "$BUYER" \
  --farmer "$FARMER" \
  --attestor "$ATTESTOR" \
  --token "$TOKEN_ID" \
  --total_amount 10000000000000 \
  --milestone_descriptions '["planting","mid-season growth","delivery"]' \
  --milestone_amounts '["3000000000000","3000000000000","4000000000000"]' \
  --quorum 2)
ESCROW_ID=$(echo "$ESCROW_ID" | tr -d '"[:space:]')
echo "Escrow ID: $ESCROW_ID"

echo
echo "==> Buyer funds the escrow (transfers 1,000,000 NGNT into the contract)..."
stellar contract invoke --id "$AGROLOCK_ID" --source-account buyer --network "$NETWORK" \
  -- fund_escrow --escrow_id "$ESCROW_ID"

for i in 0 1 2; do
  echo
  echo "==> Milestone $i: attestor confirms..."
  stellar contract invoke --id "$AGROLOCK_ID" --source-account attestor --network "$NETWORK" \
    -- confirm_milestone --escrow_id "$ESCROW_ID" --milestone_id "$i" --signer "$ATTESTOR"

  echo "==> Milestone $i: farmer confirms (2-of-3 quorum reached)..."
  stellar contract invoke --id "$AGROLOCK_ID" --source-account farmer --network "$NETWORK" \
    -- confirm_milestone --escrow_id "$ESCROW_ID" --milestone_id "$i" --signer "$FARMER"

  echo "==> Milestone $i: releasing tranche to farmer..."
  stellar contract invoke --id "$AGROLOCK_ID" --source-account deployer --network "$NETWORK" \
    -- release_tranche --escrow_id "$ESCROW_ID" --milestone_id "$i"
done

echo
echo "==> Final escrow state:"
stellar contract invoke --id "$AGROLOCK_ID" --source-account deployer --network "$NETWORK" \
  -- get_escrow --escrow_id "$ESCROW_ID"

echo
echo "==> Farmer's final NGNT balance:"
stellar contract invoke --id "$TOKEN_ID" --source-account deployer --network "$NETWORK" \
  -- balance --id "$FARMER"
