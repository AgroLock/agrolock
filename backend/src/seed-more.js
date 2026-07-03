// Adds a second wave of demo deals with real variety — different crops,
// different buyer/farmer/attestor combinations, and on-chain states the
// original 4 seed deals didn't cover (awaiting funding, a fresh unresolved
// dispute, a near-complete deal). Builds on top of scripts/setup-identities.sh
// plus buyer2/farmer2/attestor2 (created separately) and npm run seed.
// Run with: node src/seed-more.js
import { execSync } from 'node:child_process';
import { Keypair, TransactionBuilder } from '@stellar/stellar-sdk';
import { config } from './config.js';
import {
  buildCreateEscrowTx,
  buildFundEscrowTx,
  buildConfirmMilestoneTx,
  buildReleaseTrancheTx,
  buildDisputeTx,
  buildRefundTx,
  buildMintTx,
  submitSignedTx,
} from './sorobanClient.js';
import { saveDealMetadata } from './store.js';

function secretFor(name) {
  return execSync(`stellar keys secret ${name}`, { encoding: 'utf-8' }).trim();
}

const kp = {
  buyer: Keypair.fromSecret(secretFor('buyer')),
  farmer: Keypair.fromSecret(secretFor('farmer')),
  attestor: Keypair.fromSecret(secretFor('attestor')),
  buyer2: Keypair.fromSecret(secretFor('buyer2')),
  farmer2: Keypair.fromSecret(secretFor('farmer2')),
  attestor2: Keypair.fromSecret(secretFor('attestor2')),
  deployer: Keypair.fromSecret(secretFor('deployer')),
};

async function signAndSubmit(unsignedXdr, signerKeypair) {
  const tx = TransactionBuilder.fromXDR(unsignedXdr, config.networkPassphrase);
  tx.sign(signerKeypair);
  return submitSignedTx(tx.toXDR());
}

async function createEscrow({ buyerKp, farmer, attestor, totalAmount, milestoneDescriptions, milestoneAmounts, quorum }) {
  const unsignedXdr = await buildCreateEscrowTx({
    source: buyerKp.publicKey(),
    buyer: buyerKp.publicKey(),
    farmer,
    attestor,
    totalAmount,
    milestoneDescriptions,
    milestoneAmounts,
    quorum,
  });
  const result = await signAndSubmit(unsignedXdr, buyerKp);
  return String(result.returnValue);
}

async function fundEscrow(escrowId, buyerKp) {
  const unsignedXdr = await buildFundEscrowTx({ source: buyerKp.publicKey(), escrowId });
  await signAndSubmit(unsignedXdr, buyerKp);
}

async function confirmMilestone(escrowId, milestoneId, signerKp) {
  const unsignedXdr = await buildConfirmMilestoneTx({
    source: signerKp.publicKey(),
    escrowId,
    milestoneId,
    signer: signerKp.publicKey(),
  });
  await signAndSubmit(unsignedXdr, signerKp);
}

async function releaseTranche(escrowId, milestoneId) {
  const unsignedXdr = await buildReleaseTrancheTx({ source: kp.deployer.publicKey(), escrowId, milestoneId });
  await signAndSubmit(unsignedXdr, kp.deployer);
}

async function dispute(escrowId, milestoneId, signerKp) {
  const unsignedXdr = await buildDisputeTx({ source: signerKp.publicKey(), escrowId, milestoneId, signer: signerKp.publicKey() });
  await signAndSubmit(unsignedXdr, signerKp);
}

async function refund(escrowId, milestoneId, signerKp) {
  const unsignedXdr = await buildRefundTx({ source: signerKp.publicKey(), escrowId, milestoneId, signer: signerKp.publicKey() });
  await signAndSubmit(unsignedXdr, signerKp);
}

async function main() {
  console.log('Seeding additional demo deals against', config.agrolockContractId);

  console.log('\n== Topping up buyer2 NGNT balance ==');
  const mintXdr = await buildMintTx({ source: kp.deployer.publicKey(), to: kp.buyer2.publicKey(), amount: '50000000000000' });
  await signAndSubmit(mintXdr, kp.deployer);

  const standardMilestones = ['planting', 'mid-season growth', 'delivery'];

  // --- Deal: Yam, buyer + farmer2 + attestor — awaiting funding ---
  console.log('\n== Deal: awaiting funding (Yam) ==');
  const yamId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '6500000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['2000000000000', '2000000000000', '2500000000000'],
    quorum: 2,
  });
  saveDealMetadata(yamId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Yam',
    quantity: '2 tonnes',
    deliveryDate: '2027-01-10',
  });
  console.log('escrow id:', yamId);

  // --- Deal: Cocoa, buyer2 + farmer + attestor2 — funded, no votes yet ---
  console.log('\n== Deal: just funded (Cocoa) ==');
  const cocoaId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '20000000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['6000000000000', '6000000000000', '8000000000000'],
    quorum: 2,
  });
  await fundEscrow(cocoaId, kp.buyer2);
  saveDealMetadata(cocoaId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Cocoa',
    quantity: '1.5 tonnes',
    deliveryDate: '2026-12-01',
  });
  console.log('escrow id:', cocoaId);

  // --- Deal: Groundnut, buyer2 + farmer2 + attestor — early mid-milestone (1 of 2 votes on milestone 2) ---
  console.log('\n== Deal: mid-milestone, vote in progress (Groundnut) ==');
  const groundnutId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '4500000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['1350000000000', '1350000000000', '1800000000000'],
    quorum: 2,
  });
  await fundEscrow(groundnutId, kp.buyer2);
  await confirmMilestone(groundnutId, 0, kp.attestor);
  await confirmMilestone(groundnutId, 0, kp.farmer2);
  await releaseTranche(groundnutId, 0);
  await confirmMilestone(groundnutId, 1, kp.attestor);
  saveDealMetadata(groundnutId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Groundnut',
    quantity: '3 tonnes',
    deliveryDate: '2026-11-25',
  });
  console.log('escrow id:', groundnutId);

  // --- Deal: Plantain, buyer + farmer2 + attestor2 — fully completed ---
  console.log('\n== Deal: completed (Plantain) ==');
  const plantainId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '9800000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['3000000000000', '3000000000000', '3800000000000'],
    quorum: 2,
  });
  await fundEscrow(plantainId, kp.buyer);
  for (let m = 0; m < 3; m++) {
    await confirmMilestone(plantainId, m, kp.attestor2);
    await confirmMilestone(plantainId, m, kp.farmer2);
    await releaseTranche(plantainId, m);
  }
  saveDealMetadata(plantainId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Plantain',
    quantity: '2.5 tonnes',
    deliveryDate: '2026-08-30',
  });
  console.log('escrow id:', plantainId);

  // --- Deal: Beans, buyer2 + farmer + attestor — fresh dispute, not yet resolved ---
  console.log('\n== Deal: dispute in progress (Beans) ==');
  const beansId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '5200000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['1500000000000', '1500000000000', '2200000000000'],
    quorum: 2,
  });
  await fundEscrow(beansId, kp.buyer2);
  await dispute(beansId, 0, kp.buyer2);
  await refund(beansId, 0, kp.buyer2); // one vote cast; quorum is 2, so still unresolved
  saveDealMetadata(beansId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Beans',
    quantity: '2 tonnes',
    deliveryDate: '2026-10-05',
  });
  console.log('escrow id:', beansId);

  // --- Deal: Ginger, buyer + farmer + attestor2 — near-complete (2 of 3 released) ---
  console.log('\n== Deal: near-complete (Ginger) ==');
  const gingerId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '11000000000000',
    milestoneDescriptions: standardMilestones,
    milestoneAmounts: ['3000000000000', '3500000000000', '4500000000000'],
    quorum: 2,
  });
  await fundEscrow(gingerId, kp.buyer);
  await confirmMilestone(gingerId, 0, kp.attestor2);
  await confirmMilestone(gingerId, 0, kp.farmer);
  await releaseTranche(gingerId, 0);
  await confirmMilestone(gingerId, 1, kp.attestor2);
  await confirmMilestone(gingerId, 1, kp.farmer);
  await releaseTranche(gingerId, 1);
  await confirmMilestone(gingerId, 2, kp.attestor2);
  saveDealMetadata(gingerId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Ginger',
    quantity: '4 tonnes',
    deliveryDate: '2026-09-18',
  });
  console.log('escrow id:', gingerId);

  console.log('\nSeed-more complete. New escrow ids:', [yamId, cocoaId, groundnutId, plantainId, beansId, gingerId].join(', '));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
