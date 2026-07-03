import { isConnected, requestAccess, getAddress, signTransaction } from '@stellar/freighter-api';

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

// Freighter is a desktop browser extension: it works by injecting a
// `window.freighter` object into pages loaded in that browser. Mobile
// browsers (Safari/Chrome on iOS/Android) don't support that extension
// model at all, so there is nothing to detect there even with the
// Freighter mobile app installed — it doesn't hook into arbitrary
// mobile-browser pages the way the desktop extension does.
export function isMobileBrowser() {
  if (typeof navigator === 'undefined') return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export async function connectFreighter() {
  const { isConnected: hasFreighter } = await isConnected();
  if (!hasFreighter) {
    if (isMobileBrowser()) {
      throw new Error(
        "Freighter is a desktop browser extension and isn't detectable on mobile browsers, even with the Freighter app installed on your phone. Open this site on a desktop browser (Chrome, Firefox, Brave, or Edge) with the Freighter extension installed to connect."
      );
    }
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
