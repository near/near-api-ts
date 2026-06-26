import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { closePool, pool } from './db';

const migrationsDir = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'migrations');

const ensureMigrationsTable = () =>
  pool.query(`
    CREATE TABLE IF NOT EXISTS _migrations (
      name       TEXT        PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

const getAppliedMigrations = async (): Promise<Set<string>> => {
  const { rows } = await pool.query<{ name: string }>('SELECT name FROM _migrations');
  return new Set(rows.map((row) => row.name));
};

const getMigrationFiles = async (): Promise<string[]> => {
  const files = await readdir(migrationsDir);
  return files.filter((file) => file.endsWith('.sql')).sort();
};

const applyMigration = async (name: string) => {
  const sql = await readFile(path.join(migrationsDir, name), 'utf8');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('INSERT INTO _migrations (name) VALUES ($1)', [name]);
    await client.query('COMMIT');
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

export const migrate = async () => {
  await ensureMigrationsTable();
  const applied = await getAppliedMigrations();
  const files = await getMigrationFiles();
  const pending = files.filter((file) => !applied.has(file));

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const name of pending) {
    console.log(`Applying migration: ${name}`);
    await applyMigration(name);
  }
  console.log(`Applied ${pending.length} migration(s).`);
};

// Allow running directly: `tsx src/migrate.ts`.
if (import.meta.url === `file://${process.argv[1]}`) {
  migrate()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(closePool);
}