const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

function getToken() {
  return localStorage.getItem('agrolock_token');
}

export function setToken(token) {
  if (token) localStorage.setItem('agrolock_token', token);
  else localStorage.removeItem('agrolock_token');
}

async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || `Request to ${path} failed (${res.status})`);
  }
  return data;
}

export const api = {
  connect: (address) => request('/auth/connect', { method: 'POST', body: { address }, auth: false }),
  listDeals: () => request('/deals'),
  getDeal: (id) => request(`/deals/${id}`),
  createDealDraft: (payload) => request('/deals', { method: 'POST', body: payload }),
  submitDraft: (draftId, signedXdr) =>
    request(`/deals/drafts/${draftId}/submit`, { method: 'POST', body: { signedXdr } }),
  fund: (id) => request(`/deals/${id}/fund`, { method: 'POST' }),
  confirmMilestone: (id, milestoneId) =>
    request(`/deals/${id}/milestones/${milestoneId}/confirm`, { method: 'POST' }),
  releaseTranche: (id, milestoneId) =>
    request(`/deals/${id}/milestones/${milestoneId}/release`, { method: 'POST' }),
  dispute: (id, milestoneId) => request(`/deals/${id}/milestones/${milestoneId}/dispute`, { method: 'POST' }),
  refund: (id, milestoneId) => request(`/deals/${id}/milestones/${milestoneId}/refund`, { method: 'POST' }),
  submitTx: (signedXdr) => request('/tx/submit', { method: 'POST', body: { signedXdr } }),
};
