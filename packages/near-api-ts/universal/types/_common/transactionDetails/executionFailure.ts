import type { CryptoHash } from '../common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from './_common/_common/deserializers';
import type { ExecutionFailureError } from './_common/_common/executionFailureError';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { ExecutionSteps } from './_common/executionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';
import type { RefundStep } from './_common/refundStep';

export type ExecutionFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ExecutionFailure';
    error: ExecutionFailureError;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
  ExecutedNearlyFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
    status: 'ExecutionFailure';
    error: ExecutionFailureError;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ExecutionFailure';
    error: ExecutionFailureError;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
      refundSteps: RefundStep[];
    };
  };
};
