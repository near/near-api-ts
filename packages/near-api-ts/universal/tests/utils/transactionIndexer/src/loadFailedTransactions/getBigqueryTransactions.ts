import { BigQuery } from '@google-cloud/bigquery';
import * as z from 'zod/mini';

export const bigquery = new BigQuery({
  projectId: 'near-ts',
  keyFilename: './.google-cloud-key.json',
});

const FailedTransactionZodSchema = z.array(
  z.object({
    receiptId: z.string(),
    txHash: z.string(),
    blockDate: z.object({ value: z.string() }),
  }),
);

// `block_date` is the table's partition column, so filtering by it scans
// only that single day (cheap and fast). `date` is an ISO 'YYYY-MM-DD' string.
export const getBigqueryTransactions = async (date: string) => {
  const [rows] = await bigquery.query({
    query: `
        SELECT eo.receipt_id                        AS receiptId,
               rot.originated_from_transaction_hash AS txHash,
               eo.block_date                        AS blockDate
        FROM \`bigquery-public-data.crypto_near_mainnet_us.execution_outcomes\` eo
                 JOIN
             \`bigquery-public-data.crypto_near_mainnet_us.receipt_origin_transaction\` rot
             ON
                 eo.receipt_id = rot.receipt_id
        WHERE eo.block_date = @targetDate
          AND rot.block_date = @targetDate
          AND eo.status = 'FAILURE'
    `,
    params: { targetDate: date },
  });

  return FailedTransactionZodSchema.parse(rows);
};
