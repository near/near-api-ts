import type { CryptoHash } from '../../../../../_common/common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
} from './_common/_common/deserializers';
import type { ExecutionFailureErrorOfEra } from './_common/_common/executionFailureError';
import type { ProtocolEra } from './_common/_common/protocolEra';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { ExecutionSteps } from './_common/executionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';
import type { RefundStep } from './_common/refundStep';

export type ExecutionFailure<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ExecutionFailure';
    error: ExecutionFailureErrorOfEra<PE>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
    };
  };
  ExecutedNearlyFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
    status: 'ExecutionFailure';
    error: ExecutionFailureErrorOfEra<PE>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ExecutionFailure';
    error: ExecutionFailureErrorOfEra<PE>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
      refundSteps: RefundStep[];
    };
  };
};
