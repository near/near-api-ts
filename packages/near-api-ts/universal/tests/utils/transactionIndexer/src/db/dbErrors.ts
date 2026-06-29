import { pool } from './db';

// Lists every distinct `error_kind` with its occurrence count and share of the
// total, most frequent first.
export const reportDbErrors = async () => {
  const { rows } = await pool.query<{
    error_kind: string;
    count: string;
    pct: string;
  }>(`
    SELECT error_kind,
           COUNT(*)::text                                      AS count,
           ROUND(100.0 * COUNT(*) / SUM(COUNT(*)) OVER (), 2)::text AS pct
    FROM failed_transactions
    GROUP BY error_kind
    ORDER BY COUNT(*) DESC
  `);

  console.table(rows);
};

// Allow running directly: `tsx src/db/dbErrors.ts`.
if (import.meta.url === `file://${process.argv[1]}`) {
  reportDbErrors()
    .catch((error) => {
      console.error(error);
      process.exitCode = 1;
    })
    .finally(() => pool.end());
}
