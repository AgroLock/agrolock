import { Contract, rpc, TransactionBuilder, Address, nativeToScVal, scValToNative, xdr, BASE_FEE } from '@stellar/stellar-sdk';
import { config } from './config.js';

const server = new rpc.Server(config.rpcUrl);

const agrolock = () => new Contract(config.agrolockContractId);
const token = () => new Contract(config.tokenContractId);

const addr = (a) => new Address(a).toScVal();
const i128 = (n) => nativeToScVal(BigInt(n), { type: 'i128' });
const u32 = (n) => nativeToScVal(Number(n), { type: 'u32' });
const u64 = (n) => nativeToScVal(BigInt(n), { type: 'u64' });
const str = (s) => nativeToScVal(s, { type: 'string' });
const vecStr = (arr) => xdr.ScVal.scvVec(arr.map(str));
const vecI128 = (arr) => xdr.ScVal.scvVec(arr.map(i128));

async function buildTx(sourceAddress, contractInstance, method, args) {
  const account = await server.getAccount(sourceAddress);
  const op = contractInstance.call(method, ...args);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(op)
    .setTimeout(180)
    .build();
  const prepared = await server.prepareTransaction(tx);
  return prepared.toXDR();
}

async function readCall(contractInstance, method, args) {
  const account = await server.getAccount(config.readerPublicKey);
  const op = contractInstance.call(method, ...args);
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(op)
    .setTimeout(30)
    .build();
  const sim = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(sim)) {
    throw new Error(sim.error);
  }
  if (!sim.result) {
    throw new Error('Simulation returned no result (unexpected for a read call)');
  }
  return scValToNative(sim.result.retval);
}

export async function buildCreateEscrowTx({ source, buyer, farmer, attestor, totalAmount, milestoneDescriptions, milestoneAmounts, quorum }) {
  return buildTx(source, agrolock(), 'create_escrow', [
    addr(buyer),
    addr(farmer),
    addr(attestor),
    addr(config.tokenContractId),
    i128(totalAmount),
    vecStr(milestoneDescriptions),
    vecI128(milestoneAmounts),
    u32(quorum),
  ]);
}

export async function buildFundEscrowTx({ source, escrowId }) {
  return buildTx(source, agrolock(), 'fund_escrow', [u64(escrowId)]);
}

export async function buildConfirmMilestoneTx({ source, escrowId, milestoneId, signer }) {
  return buildTx(source, agrolock(), 'confirm_milestone', [u64(escrowId), u32(milestoneId), addr(signer)]);
}

export async function buildReleaseTrancheTx({ source, escrowId, milestoneId }) {
  return buildTx(source, agrolock(), 'release_tranche', [u64(escrowId), u32(milestoneId)]);
}

export async function buildDisputeTx({ source, escrowId, milestoneId, signer }) {
  return buildTx(source, agrolock(), 'dispute', [u64(escrowId), u32(milestoneId), addr(signer)]);
}

const bool = (b) => nativeToScVal(Boolean(b), { type: 'bool' });

export async function buildRefundTx({ source, escrowId, milestoneId, signer }) {
  return buildTx(source, agrolock(), 'refund', [u64(escrowId), u32(milestoneId), addr(signer)]);
}

export async function buildResolveDisputeTx({ source, escrowId, milestoneId, releaseToFarmer, signer }) {
  return buildTx(source, agrolock(), 'resolve_dispute', [
    u64(escrowId),
    u32(milestoneId),
    bool(releaseToFarmer),
    addr(signer),
  ]);
}

export async function buildMintTx({ source, to, amount }) {
  return buildTx(source, token(), 'mint', [addr(to), i128(amount)]);
}

export async function getEscrowOnChain(escrowId) {
  return readCall(agrolock(), 'get_escrow', [u64(escrowId)]);
}

export async function getMilestoneOnChain(escrowId, milestoneId) {
  return readCall(agrolock(), 'get_milestone', [u64(escrowId), u32(milestoneId)]);
}

export async function getTokenBalance(address) {
  return readCall(token(), 'balance', [addr(address)]);
}

export async function submitSignedTx(signedXdr) {
  const tx = TransactionBuilder.fromXDR(signedXdr, config.networkPassphrase);
  const sendResult = await server.sendTransaction(tx);
  if (sendResult.status === 'ERROR') {
    throw new Error(`submit failed: ${JSON.stringify(sendResult.errorResult)}`);
  }
  const hash = sendResult.hash;
  let getResult = await server.getTransaction(hash);
  const start = Date.now();
  while (getResult.status === 'NOT_FOUND' && Date.now() - start < 30000) {
    await new Promise((r) => setTimeout(r, 1500));
    getResult = await server.getTransaction(hash);
  }
  if (getResult.status !== 'SUCCESS') {
    throw new Error(`transaction ${hash} did not succeed: ${getResult.status}`);
  }
  const returnValue = getResult.returnValue ? scValToNative(getResult.returnValue) : undefined;
  return { hash, status: getResult.status, returnValue };
}
