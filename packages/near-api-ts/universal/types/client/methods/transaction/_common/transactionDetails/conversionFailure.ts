import type { CryptoHash } from '../../../../../_common/common';
import type { ConversionFailureError } from './_common/_common/conversionFailureError';
import type { MaybeBaseDeserializeTransactionActionSummariesFn } from './_common/_common/deserializers';
import type { ConversionStepFailure } from './_common/conversionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';

export type ConversionFailure<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ConversionFailure';
    error: ConversionFailureError;
    processingSteps: {
      conversionStep: ConversionStepFailure<ASF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ConversionFailure';
    error: ConversionFailureError;
    processingSteps: {
      conversionStep: ConversionStepFailure<ASF>;
    };
  };
};
