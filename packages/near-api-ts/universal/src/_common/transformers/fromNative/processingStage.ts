import type { TransactionProcessingStage } from '../../../../types/_common/transactionDetails/processingStage';
import type { RpcFinalExecutionStatus } from '../../schemas/zod/rpc/transactionDetails/transactionDetails';

/**
 * Converts a raw nearcore `finalExecutionStatus` (RPC wire vocabulary) into our
 * `TransactionProcessingStage`. This is the single boundary where the nearcore status names are
 * translated, so the rest of the domain logic operates purely on our stage names.
 *
 * Inverse of `processingStageToWaitUntil` (`../toNative/processingStage`).
 */
export const finalExecutionStatusToProcessingStage = (
  status: RpcFinalExecutionStatus,
): TransactionProcessingStage => {
  if (status === 'INCLUDED') return 'ConvertedOptimistic';
  if (status === 'INCLUDED_FINAL') return 'ConvertedFinal';
  if (status === 'EXECUTED_OPTIMISTIC') return 'ExecutedOptimistic';
  if (status === 'EXECUTED') return 'ExecutedNearlyFinal';
  if (status === 'FINAL') return 'CompletedFinal';
  throw new Error(`Unknown finalExecutionStatus: ${status}`);
};
