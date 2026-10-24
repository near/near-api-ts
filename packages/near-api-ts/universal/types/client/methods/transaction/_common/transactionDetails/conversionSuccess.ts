import type { CryptoHash } from '../../../../../_common/common';
import type { MaybeBaseDeserializeTransactionActionSummariesFn } from './_common/_common/deserializers';
import type { ProtocolEra } from './_common/_common/protocolEra';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';

export type ConversionSuccess<
  PE extends ProtocolEra,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
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
      conversionStep: ConversionStepSuccess<PE, ASF>;
    };
  };
};
