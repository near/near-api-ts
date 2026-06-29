import 'dotenv/config';
import pg, { type PoolConfig } from 'pg';

// Defaults match docker-compose.yml, so the package works out of the box.
// Override via env vars (e.g. in `.env`) when pointing at another database.
export const dbConfig: PoolConfig = {
  host: process.env.PGHOST ?? 'localhost',
  port: Number(process.env.PGPORT ?? 5432),
  user: process.env.PGUSER ?? 'indexer',
  password: process.env.PGPASSWORD ?? 'indexer',
  database: process.env.PGDATABASE ?? 'transaction_indexer',
};

export const pool = new pg.Pool(dbConfig);
