import { createDayLogger } from '../logger';
import { fetchRpcTransaction } from './fetchRpcTransaction/fetchRpcTransaction';
import { getBigqueryTransactions } from './getBigqueryTransactions';

// We don't want to send 100k+ requests to RPC at the same time, so we process
// them in chunks of this size.
const CHUNK_SIZE = 50;

const getChunks = <I>(arr: I[], size: number) => {
  const result = [];
  for (let i = 0; i < arr.length; i += size) {
    result.push(arr.slice(i, i + size));
  }
  return result;
};

export const loadTransactionsWithErrors = async (days: string[]) => {
  for (const day of days) {
    // One log file per day; flushed on completion (even on failure).
    const { logger, close } = createDayLogger(day);
    try {
      logger.info('day started');

      // 1. Fetch all failed transactions for the day.
      // const allRows = (await getBigqueryTransactions(day)).slice(0, 20);
      const allRows = await getBigqueryTransactions(day);
      logger.info({ count: allRows.length }, 'fetched failed transactions');

      // 2. Process them in chunks so RPC isn't hit with everything at once.
      const chunks = getChunks(allRows, CHUNK_SIZE);
      let processed = 0;
      let failed = 0;

      for (const chunk of chunks) {
        const results = await Promise.allSettled(
          chunk.map(({ txHash, receiptId, blockDate }) =>
            fetchRpcTransaction(txHash, receiptId, blockDate.value, 1, logger),
          ),
        );

        processed += chunk.length;
        failed += results.filter(
          (result) => result.status === 'fulfilled' && result.value === 'failed',
        ).length;

        logger.info({ processed, total: allRows.length, failed }, 'progress');
      }

      logger.info({ total: allRows.length, failed }, 'day finished');
    } catch (err) {
      // BigQuery or other unexpected per-day failure — record it and keep going
      // with the remaining days.
      logger.error({ err }, 'day failed');
    } finally {
      close();
    }
  }
};
