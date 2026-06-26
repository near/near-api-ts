import pg from 'pg';
import { dbConfig } from './config';

// A single shared pool for the whole package. Callers use `pool.query(...)`
// or `pool.connect()` for transactions, and `closePool()` on shutdown.
export const pool = new pg.Pool(dbConfig);

export const closePool = () => pool.end();