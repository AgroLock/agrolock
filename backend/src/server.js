import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import { authRouter } from './routes/auth.js';
import { dealsRouter } from './routes/deals.js';
import { txRouter } from './routes/tx.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/auth', authRouter);
app.use('/deals', dealsRouter);
app.use('/tx', txRouter);

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(config.port, () => {
  console.log(`AgroLock backend listening on http://localhost:${config.port}`);
  console.log(`AgroLock contract: ${config.agrolockContractId}`);
  console.log(`NGNT token contract: ${config.tokenContractId}`);
});
