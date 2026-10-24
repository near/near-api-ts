import type { CryptoHash } from '../../../../../_common/common';
import type { ConversionFailureError } from './_common/_common/conversionFailureError';
import type { MaybeBaseDeserializeTransactionActionSummariesFn } from './_common/_common/deserializers';
import type { ProtocolEra } from './_common/_common/protocolEra';
import type { ConversionStepFailure } from './_common/conversionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';

export type ConversionFailure<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ConversionFailure';
    error: ConversionFailureError;
    processingSteps: {
      conversionStep: ConversionStepFailure<PE, ASF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ConversionFailure';
    error: ConversionFailureError;
    processingSteps: {
      conversionStep: ConversionStepFailure<PE, ASF>;
    };
  };
};
