// Populates the demo with a handful of escrows in different real on-chain
// states (funded / mid-milestone / disputed) so the app is immediately
// demoable. Signs locally with the same testnet identities scripts/*.sh
// use (via `stellar keys secret`), rather than going through Freighter,
// since this runs headless. Run with: npm run seed
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
  deployer: Keypair.fromSecret(secretFor('deployer')),
};

async function signAndSubmit(unsignedXdr, signerKeypair) {
  const tx = TransactionBuilder.fromXDR(unsignedXdr, config.networkPassphrase);
  tx.sign(signerKeypair);
  return submitSignedTx(tx.toXDR());
}

async function createEscrow({ farmer, attestor, totalAmount, milestoneDescriptions, milestoneAmounts, quorum }) {
  const unsignedXdr = await buildCreateEscrowTx({
    source: kp.buyer.publicKey(),
    buyer: kp.buyer.publicKey(),
    farmer,
    attestor,
    totalAmount,
    milestoneDescriptions,
    milestoneAmounts,
    quorum,
  });
  const result = await signAndSubmit(unsignedXdr, kp.buyer);
  return String(result.returnValue);
}

async function fundEscrow(escrowId) {
  const unsignedXdr = await buildFundEscrowTx({ source: kp.buyer.publicKey(), escrowId });
  await signAndSubmit(unsignedXdr, kp.buyer);
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
  console.log('Seeding demo deals against', config.agrolockContractId);

  console.log('\n== Topping up buyer NGNT balance ==');
  const mintXdr = await buildMintTx({ source: kp.deployer.publicKey(), to: kp.buyer.publicKey(), amount: '50000000000000' });
  await signAndSubmit(mintXdr, kp.deployer);

  const partiesMeta = {
    buyer: kp.buyer.publicKey(),
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
  };

  console.log('\n== Deal: just funded (Cassava) ==');
  const fundedId = await createEscrow({
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '8000000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['2400000000000', '2400000000000', '3200000000000'],
    quorum: 2,
  });
  await fundEscrow(fundedId);
  saveDealMetadata(fundedId, { ...partiesMeta, cropType: 'Cassava', quantity: '4 tonnes', deliveryDate: '2026-12-15' });
  console.log('escrow id:', fundedId);

  console.log('\n== Deal: mid-milestone (Sorghum) ==');
  const midId = await createEscrow({
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '12000000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['3600000000000', '3600000000000', '4800000000000'],
    quorum: 2,
  });
  await fundEscrow(midId);
  await confirmMilestone(midId, 0, kp.attestor);
  await confirmMilestone(midId, 0, kp.farmer);
  await releaseTranche(midId, 0);
  await confirmMilestone(midId, 1, kp.attestor);
  saveDealMetadata(midId, { ...partiesMeta, cropType: 'Sorghum', quantity: '6 tonnes', deliveryDate: '2026-10-20' });
  console.log('escrow id:', midId);

  console.log('\n== Deal: disputed (Rice) ==');
  const disputedId = await createEscrow({
    farmer: kp.farmer.publicKey(),
    attestor: kp.attestor.publicKey(),
    totalAmount: '9000000000000',
    milestoneDescriptions: ['planting', 'mid-season growth', 'delivery'],
    milestoneAmounts: ['2700000000000', '2700000000000', '3600000000000'],
    quorum: 2,
  });
  await fundEscrow(disputedId);
  await dispute(disputedId, 0, kp.buyer);
  await refund(disputedId, 0, kp.buyer);
  saveDealMetadata(disputedId, { ...partiesMeta, cropType: 'Rice (paddy)', quantity: '3 tonnes', deliveryDate: '2026-09-05' });
  console.log('escrow id:', disputedId);

  // Register the pre-existing completed escrow created earlier via scripts/interact.sh.
  saveDealMetadata('1', { ...partiesMeta, cropType: 'Maize', quantity: '5 tonnes', deliveryDate: '2026-11-01' });

  console.log('\nSeed complete. Escrow ids: 1 (completed),', fundedId, '(funded),', midId, '(mid-milestone),', disputedId, '(disputed)');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
