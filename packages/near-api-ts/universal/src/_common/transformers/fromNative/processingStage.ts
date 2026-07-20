import type { FinalExecutionStatusToProcessingStage } from '../../../../types/_common/transactionDetails/processingStage';

const finalExecutionStatusToProcessingStageMap: FinalExecutionStatusToProcessingStage = {
  INCLUDED: 'ConvertedOptimistic',
  INCLUDED_FINAL: 'ConvertedFinal',
  EXECUTED_OPTIMISTIC: 'ExecutedOptimistic',
  EXECUTED: 'ExecutedNearlyFinal',
  FINAL: 'CompletedFinal',
};

/**
 * Converts a raw nearcore `finalExecutionStatus` (RPC wire vocabulary) into our
 * `TransactionProcessingStage`. This is the single boundary where the nearcore status names are
 * translated, so the rest of the domain logic operates purely on our stage names.
 *
 * The return type is derived from `status`, so e.g. passing `'INCLUDED'` yields the literal
 * `'ConvertedOptimistic'` — no unsafe cast required.
 *
 * Inverse of `processingStageToWaitUntil` (`../toNative/processingStage`).
 */
export const finalExecutionStatusToProcessingStage = <
  S extends keyof FinalExecutionStatusToProcessingStage,
>(
  status: S,
): FinalExecutionStatusToProcessingStage[S] => finalExecutionStatusToProcessingStageMap[status];
