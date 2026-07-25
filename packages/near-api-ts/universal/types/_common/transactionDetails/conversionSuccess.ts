import type { CryptoHash } from '../common';
import type { MaybeBaseDeserializeTransactionActionSummariesFn } from './_common/_common/deserializers';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';

export type ConversionSuccess<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  ConvertedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ConvertedOptimistic'];
    status: 'ConversionSuccess';
  };
  ConvertedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ConvertedFinal'];
    status: 'ConversionSuccess';
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
    };
  };
};
