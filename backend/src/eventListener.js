import { rpc, scValToNative } from '@stellar/stellar-sdk';
import { config } from './config.js';
import { saveDealMetadata } from './store.js';

const server = new rpc.Server(config.rpcUrl);
let isRunning = false;
let lastLedger = 0;

export async function pollEvents() {
  if (!config.agrolockContractId) return;

  try {
    const latestLedgerRes = await server.getLatestLedger();
    const currentLedger = latestLedgerRes.sequence;

    if (lastLedger === 0) {
      lastLedger = Math.max(1, currentLedger - 100);
    }

    if (lastLedger >= currentLedger) return;

    const response = await server.getEvents({
      startLedger: lastLedger,
      filters: [
        {
          type: 'contract',
          contractIds: [config.agrolockContractId],
        },
      ],
    });

    if (response && response.events) {
      for (const event of response.events) {
        try {
          const topic = event.topic ? event.topic.map(scValToNative) : [];
          const value = event.value ? scValToNative(event.value) : null;
          const eventType = topic[0];

          if (eventType === 'created') {
            const escrowId = String(topic[1]);
            const buyer = Array.isArray(value) ? value[0] : value;
            saveDealMetadata(escrowId, { buyer, status: 'Created', lastSyncedLedger: event.ledger });
          } else if (eventType === 'funded') {
            const escrowId = String(topic[1]);
            saveDealMetadata(escrowId, { status: 'Funded', lastSyncedLedger: event.ledger });
          } else if (eventType === 'released' || eventType === 'refunded' || eventType === 'resolved') {
            const escrowId = String(topic[1]);
            saveDealMetadata(escrowId, { lastSyncedLedger: event.ledger });
          }
        } catch (parseErr) {
          console.error('[EventListener] Error parsing event:', parseErr.message);
        }
      }
    }

    lastLedger = currentLedger;
  } catch (err) {
    console.error('[EventListener] RPC polling error:', err.message);
  }
}

export function startEventListener(intervalMs = 15000) {
  if (isRunning) return;
  isRunning = true;
  console.log(`[EventListener] Soroban RPC event indexer started (polling every ${intervalMs / 1000}s)`);
  pollEvents();
  return setInterval(pollEvents, intervalMs);
}
