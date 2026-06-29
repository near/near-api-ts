import type { Logger } from 'pino';
import { safeSleep } from '../../../../../../src/_common/utils/sleep';
import { pool } from '../../db/db';
import { getActionErrorKind } from './getActionErrorKind';

export type FetchResult = 'ok' | 'failed';

// Error thrown for non-2xx RPC responses, carrying enough context for the logs
// to clearly distinguish a rate limit (HTTP 429) from other failures.
class RpcHttpError extends Error {
  constructor(
    readonly status: number,
    readonly retryAfterMs: number | null,
    readonly body: string,
  ) {
    super(`RPC HTTP ${status}`);
    this.name = 'RpcHttpError';
  }

  get rateLimited() {
    return this.status === 429;
  }
}

// `Retry-After` may be seconds ("2") or an HTTP date; returns a delay in ms.
const parseRetryAfter = (header: string | null): number | null => {
  if (!header) return null;
  const seconds = Number(header);
  if (!Number.isNaN(seconds)) return seconds * 1000;
  const date = Date.parse(header);
  return Number.isNaN(date) ? null : Math.max(0, date - Date.now());
};

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

    // fetch only rejects on network errors, so a 429/5xx arrives here as a
    // non-ok response — check explicitly so rate limits are surfaced.
    if (!response.ok) {
      const retryAfterMs = parseRetryAfter(response.headers.get('retry-after'));
      const body = await response.text().catch(() => '');
      throw new RpcHttpError(response.status, retryAfterMs, body.slice(0, 500));
    }

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
    const rateLimited = err instanceof RpcHttpError && err.rateLimited;
    const status = err instanceof RpcHttpError ? err.status : undefined;

    // Retry transient failures (RPC/network/DB) up to 3 attempts, then record
    // the final failure with the txHash so it can be found in the day's log.
    if (attempt <= 3) {
      const backoffMs = (err instanceof RpcHttpError ? err.retryAfterMs : null) ?? 3000;

      if (rateLimited) {
        logger.warn(
          { txHash, attempt, status, backoffMs },
          'rate limited — backing off and retrying',
        );
      }

      await safeSleep(backoffMs);
      return fetchRpcTransaction(txHash, receiptId, blockDate, attempt + 1, logger);
    }

    logger.error(
      { txHash, attempt, rateLimited, status, err },
      rateLimited ? 'fetchRpcTransaction failed: rate limited' : 'fetchRpcTransaction failed',
    );
    return 'failed';
  }
};
