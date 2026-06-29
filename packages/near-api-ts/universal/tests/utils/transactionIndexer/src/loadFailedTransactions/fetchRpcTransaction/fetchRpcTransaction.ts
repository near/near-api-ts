import type { Logger } from 'pino';
import { pool } from '../../db/db';
import { getActionErrorKind } from './getActionErrorKind';

export type FetchResult = 'ok' | 'failed';

export const fetchRpcTransaction = async (
  txHash: string,
  receiptId: string,
  blockDate: string,
  attempt: number,
  logger: Logger,
): Promise<FetchResult> => {
  try {
    const response = await fetch('https://archival-rpc.mainnet.fastnear.com', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.FASTNEAR_RPC_API_TOKEN}`,
      },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 0,
        method: 'EXPERIMENTAL_tx_status',
        params: {
          tx_hash: txHash,
          sender_account_id: 'any',
        },
      }),
    });

    const rawResponse = await response.json();
    const actionErrorKind = getActionErrorKind(rawResponse, receiptId);

    // Idempotent re-runs: if the tx is already stored, overwrite it with the
    // latest data. Use `ON CONFLICT (tx_hash) DO NOTHING` instead of skip it.
    await pool.query(
      `INSERT INTO failed_transactions (receipt_id, tx_hash, error_kind, block_date, raw_response)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (receipt_id) DO NOTHING`,
      [receiptId, txHash, actionErrorKind, blockDate, rawResponse],
    );

    return 'ok';
  } catch (err) {
    // Retry transient failures (RPC/network/DB) up to 3 attempts, then record
    // the final failure with the txHash so it can be found in the day's log.
    if (attempt <= 3) {
      return fetchRpcTransaction(txHash, receiptId, blockDate, attempt + 1, logger);
    }

    logger.error({ txHash, attempt, err }, 'fetchRpcTransaction failed');
    return 'failed';
  }
};
