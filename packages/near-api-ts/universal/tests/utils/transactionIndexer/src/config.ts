import type { PoolConfig } from 'pg';

// Defaults match docker-compose.yml, so the package works out of the box.
// Override via env vars when pointing at another database.
export const dbConfig: PoolConfig = {
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? 'indexer',
  password: process.env.PGPASSWORD ?? 'indexer',
  database: process.env.PGDATABASE ?? 'transaction_indexer',
};
