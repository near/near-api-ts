import { pool } from './db';

// Reports the on-disk footprint of `failed_transactions`: total size with its
// heap / index / TOAST breakdown, plus row count and average size per row.
export const reportDbSize = async () => {
  const { rows } = await pool.query<{
    rows: string;
    total: string;
    heap_only: string;
    indexes: string;
    toast: string;
    avg_per_row: string;
  }>(`
    SELECT
      count(*)::text                                               AS rows,
      pg_size_pretty(pg_total_relation_size('failed_transactions')) AS total,
      pg_size_pretty(pg_relation_size('failed_transactions'))       AS heap_only,
      pg_size_pretty(pg_indexes_size('failed_transactions'))        AS indexes,
      pg_size_pretty(pg_total_relation_size('failed_transactions')
                   - pg_relation_size('failed_transactions')
                   - pg_indexes_size('failed_transactions'))        AS toast,
      pg_size_pretty(pg_total_relation_size('failed_transactions')
                   / NULLIF(count(*), 0))                           AS avg_per_row
    FROM failed_transactions
  `);

  console.table(rows[0]);
};

// Allow running directly: `tsx src/dbSize.ts`.
if (import.meta.url === `file://${process.argv[1]}`) {
  reportDbSize()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}