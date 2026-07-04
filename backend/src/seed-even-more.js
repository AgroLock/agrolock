// Third wave of demo deals — this batch demonstrates contract features the
// first two waves didn't: non-default quorum (all-3 and any-1), milestone
// schedules other than the standard 3-way split, and a deal that's fully
// disputed and refunded on every milestone (a "total early exit" handled
// gracefully rather than a partial state). Run with: node src/seed-even-more.js
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
  console.log('Seeding a third wave of demo deals against', config.agrolockContractId);

  console.log('\n== Topping up buyer + buyer2 NGNT balances ==');
  for (const b of [kp.buyer, kp.buyer2]) {
    const mintXdr = await buildMintTx({ source: kp.deployer.publicKey(), to: b.publicKey(), amount: '100000000000000' });
    await signAndSubmit(mintXdr, kp.deployer);
  }

  // --- Tomato: buyer + farmer + attestor2, quorum = 3 (unanimous), 2 milestones ---
  console.log('\n== Deal: unanimous quorum, 2 of 3 signed (Tomato) ==');
  const tomatoId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '3000000000000',
    milestoneDescriptions: ['harvest', 'delivery'],
    milestoneAmounts: ['1200000000000', '1800000000000'],
    quorum: 3,
  });
  await fundEscrow(tomatoId, kp.buyer);
  await confirmMilestone(tomatoId, 0, kp.farmer);
  await confirmMilestone(tomatoId, 0, kp.attestor2); // 2 of 3 — quorum is 3, still pending
  saveDealMetadata(tomatoId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Tomato',
    quantity: '1 tonne',
    deliveryDate: '2026-08-10',
  });
  console.log('escrow id:', tomatoId);

  // --- Sesame: buyer2 + farmer2 + attestor2, quorum = 1 (any single party) ---
  console.log('\n== Deal: any-1 quorum, fast release (Sesame) ==');
  const sesameId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '1800000000000',
    milestoneDescriptions: ['harvest', 'delivery'],
    milestoneAmounts: ['900000000000', '900000000000'],
    quorum: 1,
  });
  await fundEscrow(sesameId, kp.buyer2);
  await confirmMilestone(sesameId, 0, kp.attestor2); // 1 of 1 needed — releasable immediately
  await releaseTranche(sesameId, 0);
  saveDealMetadata(sesameId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Sesame',
    quantity: '1.5 tonnes',
    deliveryDate: '2026-08-22',
  });
  console.log('escrow id:', sesameId);

  // --- Soybean: buyer + farmer2 + attestor, 4-milestone schedule ---
  console.log('\n== Deal: 4-milestone schedule, half released (Soybean) ==');
  const soybeanId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '24000000000000',
    milestoneDescriptions: ['land preparation', 'planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['3600000000000', '6000000000000', '6000000000000', '8400000000000'],
    quorum: 2,
  });
  await fundEscrow(soybeanId, kp.buyer);
  for (let m = 0; m < 2; m++) {
    await confirmMilestone(soybeanId, m, kp.attestor);
    await confirmMilestone(soybeanId, m, kp.farmer2);
    await releaseTranche(soybeanId, m);
  }
  saveDealMetadata(soybeanId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Soybean',
    quantity: '5 tonnes',
    deliveryDate: '2026-12-20',
  });
  console.log('escrow id:', soybeanId);

  // --- Hibiscus (Zobo): buyer2 + farmer + attestor2 — fully disputed and refunded ---
  console.log('\n== Deal: fully refunded, total early exit (Hibiscus / Zobo) ==');
  const hibiscusId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    totalAmount: '6200000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['1860000000000', '1860000000000', '2480000000000'],
    quorum: 2,
  });
  await fundEscrow(hibiscusId, kp.buyer2);
  for (let m = 0; m < 3; m++) {
    await dispute(hibiscusId, m, kp.buyer2);
    await refund(hibiscusId, m, kp.buyer2);
    await refund(hibiscusId, m, kp.attestor2);
  }
  saveDealMetadata(hibiscusId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor2.publicKey(),
    cropType: 'Hibiscus (Zobo)',
    quantity: '1 tonne',
    deliveryDate: '2026-07-30',
  });
  console.log('escrow id:', hibiscusId);

  // --- Cotton: buyer + farmer + attestor — awaiting funding ---
  console.log('\n== Deal: awaiting funding (Cotton) ==');
  const cottonId = await createEscrow({
    buyerKp: kp.buyer,
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '15000000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['4500000000000', '4500000000000', '6000000000000'],
    quorum: 2,
  });
  saveDealMetadata(cottonId, {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Cotton',
    quantity: '6 tonnes',
    deliveryDate: '2027-02-15',
  });
  console.log('escrow id:', cottonId);

  // --- Cashew: buyer2 + farmer2 + attestor — just funded ---
  console.log('\n== Deal: just funded (Cashew) ==');
  const cashewId = await createEscrow({
    buyerKp: kp.buyer2,
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '30000000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['9000000000000', '9000000000000', '12000000000000'],
    quorum: 2,
  });
  await fundEscrow(cashewId, kp.buyer2);
  saveDealMetadata(cashewId, {
    buyer: kp.buyer2.publicKey(),
    farmer: kp.farmer2.publicKey(),
    attestor: kp.attestor.publicKey(),
    cropType: 'Cashew',
    quantity: '3 tonnes',
    deliveryDate: '2026-11-30',
  });
  console.log('escrow id:', cashewId);

  console.log(
    '\nSeed-even-more complete. New escrow ids:',
    [tomatoId, sesameId, soybeanId, hibiscusId, cottonId, cashewId].join(', ')
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
