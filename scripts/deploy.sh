#!/usr/bin/env bash
# Builds and deploys the AgroLock contract to Stellar Testnet, and deploys
# a demo Stellar Asset Contract (SAC) token to stand in for the Naira
# stablecoin used in the pitch (real deployment would use an anchor-issued
# asset instead). Prints the resulting contract IDs.
set -euo pipefail

NETWORK="testnet"
CONTRACTS_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/../contracts" && pwd)"

echo "==> Building agrolock contract (wasm32v1-none, release)..."
(cd "$CONTRACTS_DIR" && stellar contract build --package agrolock)

WASM_PATH="$CONTRACTS_DIR/target/wasm32v1-none/release/agrolock.wasm"

echo "==> Deploying agrolock contract to $NETWORK..."
CONTRACT_ID=$(stellar contract deploy \
  --wasm "$WASM_PATH" \
  --source-account deployer \
  --network "$NETWORK" \
  --alias agrolock)
echo "AgroLock contract ID: $CONTRACT_ID"

echo "==> Issuing demo NGNT (Naira testnet token) asset via deployer..."
TOKEN_ID=$(stellar contract asset deploy \
  --asset "NGNT:$(stellar keys address deployer)" \
  --source-account deployer \
  --network "$NETWORK" \
  --alias ngnt)
echo "Demo token (NGNT) contract ID: $TOKEN_ID"

mkdir -p "$(dirname "${BASH_SOURCE[0]}")/../.deployed"
cat > "$(dirname "${BASH_SOURCE[0]}")/../.deployed/testnet.json" <<EOF
{
  "network": "$NETWORK",
  "agrolockContractId": "$CONTRACT_ID",
  "tokenContractId": "$TOKEN_ID"
}
EOF

echo
echo "==> Saved addresses to .deployed/testnet.json"
echo "AGROLOCK_CONTRACT_ID=$CONTRACT_ID"
echo "TOKEN_CONTRACT_ID=$TOKEN_ID"
