import { BigQuery } from '@google-cloud/bigquery';

export const bigquery = new BigQuery({
  projectId: 'near-ts',
  keyFilename: './.google-cloud-key.json',
});

export type FailedTransactions = {
  txHash: string;
};

// `block_date` is the table's partition column, so filtering by it scans
// only that single day (cheap and fast). `date` is an ISO 'YYYY-MM-DD' string.
export const getFailedTransactionsByDay = async (date: string) => {
  const [rows] = await bigquery.query({
    query: `
        SELECT DISTINCT rot.originated_from_transaction_hash AS txHash
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
  return rows as FailedTransactions[];
};
