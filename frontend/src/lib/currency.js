// The contract settles in a 7-decimal stablecoin (matching Stellar's SAC
// convention). We show everything in Naira in the UI and only ever mention
// the underlying token in a small "how settlement works" aside — see
// README for why (testnet demo standing in for a real anchor-issued asset).
const DECIMALS = 7n;
const SCALE = 10n ** DECIMALS;

export function baseUnitsToNaira(baseUnits) {
  return Number(BigInt(baseUnits)) / Number(SCALE);
}

export function nairaToBaseUnits(naira) {
  const [whole, frac = ''] = String(naira).trim().split('.');
  const fracPadded = (frac + '0000000').slice(0, 7);
  return (BigInt(whole || '0') * SCALE + BigInt(fracPadded || '0')).toString();
}

export function formatNaira(baseUnits) {
  const value = baseUnitsToNaira(baseUnits);
  return `₦${value.toLocaleString('en-NG', { maximumFractionDigits: 0 })}`;
}
