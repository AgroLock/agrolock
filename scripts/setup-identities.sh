#!/usr/bin/env bash
# One-time setup: creates and funds the four Stellar Testnet identities
# AgroLock's demo uses (buyer, farmer, attestor, admin/deployer) and a demo
# token contract they'll trade with. Safe to re-run; skips identities that
# already exist.
set -euo pipefail

NETWORK="testnet"

for name in deployer buyer farmer attestor; do
  if stellar keys address "$name" >/dev/null 2>&1; then
    echo "identity '$name' already exists: $(stellar keys address "$name")"
  else
    echo "creating identity '$name'..."
    stellar keys generate "$name" --network "$NETWORK" --fund
  fi
done

echo
echo "Identities:"
for name in deployer buyer farmer attestor; do
  echo "  $name: $(stellar keys address "$name")"
done
