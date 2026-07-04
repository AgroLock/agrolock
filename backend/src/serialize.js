// Soroban's JS SDK represents fieldless (unit) contract enum variants as a
// one-element array, e.g. status: ["Completed"]. Flatten those, stringify
// bigints (i128/u64 amounts), and convert snake_case contract field names
// to the camelCase the frontend expects.
function flattenEnum(value) {
  return Array.isArray(value) && value.length === 1 && typeof value[0] === 'string' ? value[0] : value;
}

function stringifyBigints(value) {
  return typeof value === 'bigint' ? value.toString() : value;
}

export function normalizeMilestone(m, index) {
  return {
    index,
    description: m.description,
    amount: stringifyBigints(m.amount),
    status: flattenEnum(m.status),
    releaseVotes: m.release_votes,
    refundVotes: m.refund_votes,
  };
}

export function normalizeEscrow(raw, escrowId) {
  return {
    id: String(escrowId),
    buyer: raw.buyer,
    farmer: raw.farmer,
    attestor: raw.attestor,
    token: raw.token,
    totalAmount: stringifyBigints(raw.total_amount),
    quorum: raw.quorum,
    status: flattenEnum(raw.status),
    milestones: raw.milestones.map(normalizeMilestone),
  };
}
