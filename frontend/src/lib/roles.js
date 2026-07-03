export function rolesFor(address, deal) {
  if (!address || !deal) return [];
  const roles = [];
  if (address === deal.buyer) roles.push('buyer');
  if (address === deal.farmer) roles.push('farmer');
  if (address === deal.attestor) roles.push('attestor');
  return roles;
}

export const ROLE_LABELS = {
  buyer: 'Buyer',
  farmer: 'Farmer',
  attestor: 'Attestor',
};

export function short(address) {
  if (!address) return '';
  return `${address.slice(0, 4)}…${address.slice(-4)}`;
}
