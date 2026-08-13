import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { dealsRouter } from './routes/deals.js';
import { txRouter } from './routes/tx.js';
import { startEventListener } from './eventListener.js';

const app = express();

// Disable X-Powered-By header for security
app.disable('x-powered-by');

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Body parser payload limits
app.use(express.json({ limit: '100kb' }));

// Request logging middleware
app.use((req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
});

app.get('/health', (req, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));
app.get('/health/network', async (req, res) => {
  try {
    const { rpc } = await import('@stellar/stellar-sdk');
    const server = new rpc.Server(config.rpcUrl);
    const latestLedger = await server.getLatestLedger();
    res.json({
      status: 'ok',
      network: 'testnet',
      rpcUrl: config.rpcUrl,
      agrolockContractId: config.agrolockContractId,
      tokenContractId: config.tokenContractId,
      latestLedgerSequence: latestLedger.sequence,
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});
app.use('/auth', authRouter);
app.use('/deals', dealsRouter);
app.use('/tx', txRouter);

app.use((err, req, res, next) => {
  console.error('[Error]', err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`AgroLock backend listening on http://localhost:${config.port}`);
  console.log(`AgroLock contract: ${config.agrolockContractId}`);
  console.log(`NGNT token contract: ${config.tokenContractId}`);
  startEventListener();
});

