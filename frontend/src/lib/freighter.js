import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export async function connectFreighter() {
  const { isConnected: hasFreighter } = await isConnected();
  if (!hasFreighter) {
    throw new Error('Freighter wallet not detected. Install it from freighter.app and refresh.');
  }
  const { address, error } = await requestAccess();
  if (error) throw new Error(error.message || 'Freighter access was denied');
  return address;
}

export async function currentFreighterAddress() {
  const { isConnected: hasFreighter } = await isConnected();
  if (!hasFreighter) return null;
  const { address } = await getAddress();
  return address || null;
}

export async function signWithFreighter(xdr, address) {
  const { signedTxXdr, error } = await signTransaction(xdr, {
    networkPassphrase: NETWORK_PASSPHRASE,
    address,
  });
  if (error) throw new Error(error.message || 'Signing was rejected in Freighter');
  return signedTxXdr;
}
