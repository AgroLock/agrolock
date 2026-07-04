import 'dotenv/config';

export const config = {
  port: process.env.PORT || 4000,
  jwtSecret: process.env.JWT_SECRET || 'dev-secret-change-me',
  rpcUrl: process.env.SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  networkPassphrase: process.env.NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
  agrolockContractId: process.env.AGROLOCK_CONTRACT_ID,
  tokenContractId: process.env.TOKEN_CONTRACT_ID,
  readerPublicKey: process.env.READER_PUBLIC_KEY,
};

for (const key of ['agrolockContractId', 'tokenContractId', 'readerPublicKey']) {
  if (!config[key]) {
    console.warn(`[config] Missing ${key} in environment — set it in backend/.env (see .env.example).`);
  }
}
