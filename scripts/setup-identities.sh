#!/usr/bin/env bash
# One-time setup: creates and funds the Stellar Testnet identities
# AgroLock's demo uses — the core four (buyer, farmer, attestor,
# admin/deployer), a second buyer/farmer/attestor set for demo variety, and
# a zero-deals throwaway for testing the empty-dashboard state. Safe to
# re-run; skips identities that already exist.
set -euo pipefail

NETWORK="testnet"

for name in deployer buyer farmer attestor buyer2 farmer2 attestor2 emptytest; do
  if stellar keys address "$name" >/dev/null 2>&1; then
    echo "identity '$name' already exists: $(stellar keys address "$name")"
  else
    echo "creating identity '$name'..."
    stellar keys generate "$name" --network "$NETWORK" --fund
  fi
done

echo
echo "Identities:"
for name in deployer buyer farmer attestor buyer2 farmer2 attestor2 emptytest; do
  echo "  $name: $(stellar keys address "$name")"
done
