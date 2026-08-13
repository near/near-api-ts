import type { TransactionProcessingStage } from '../../../../../types/client/methods/transaction/_common/transactionDetails/_common/processingStage';

// TODO Unite with finalExecutionStatusToProcessingStage
export const processingStageToWaitUntil = (processingStage: TransactionProcessingStage) => {
  switch (processingStage) {
    case 'ConvertedOptimistic':
      return 'INCLUDED';
    case 'ConvertedFinal':
      return 'INCLUDED_FINAL';
    case 'ExecutedOptimistic':
      return 'EXECUTED_OPTIMISTIC';
    case 'ExecutedNearlyFinal':
      return 'EXECUTED';
    case 'CompletedFinal':
      return 'FINAL';
  }
};

export const withDefaultProcessingStage = (
  processingStage?: TransactionProcessingStage,
): TransactionProcessingStage => processingStage ?? 'ExecutedOptimistic';
