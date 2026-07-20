import type { TransactionProcessingStage } from '../../../../types/_common/transactionDetails/processingStage';

export const processingStageToWaitUntil = (processingStage: TransactionProcessingStage) => {
  if (processingStage === 'ConvertedOptimistic') return 'INCLUDED';
  if (processingStage === 'ConvertedFinal') return 'INCLUDED_FINAL';
  if (processingStage === 'ExecutedOptimistic') return 'EXECUTED_OPTIMISTIC';
  if (processingStage === 'ExecutedNearlyFinal') return 'EXECUTED';
  if (processingStage === 'CompletedFinal') return 'FINAL';
  throw new Error(`Unknown processing stage: ${processingStage}`);
};

export const withDefaultProcessingStage = (
  processingStage?: TransactionProcessingStage,
): TransactionProcessingStage => processingStage ?? 'ExecutedOptimistic';
