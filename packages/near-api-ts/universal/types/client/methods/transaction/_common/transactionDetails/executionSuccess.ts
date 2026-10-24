import type { CryptoHash } from '../../../../../_common/common';
import type {
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from './_common/_common/deserializers';
import type { ProtocolEra } from './_common/_common/protocolEra';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { ExecutionSteps } from './_common/executionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';
import type { RefundStep } from './_common/refundStep';

// `data` is a return type of custom deserializer (passed by user) or unknown;
export type TransactionResultData<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
> = [RDF] extends [BaseDeserializeTransactionResultDataFn] ? ReturnType<RDF> : unknown;

export type ExecutionSuccess<
  PE extends ProtocolEra,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
    };
  };
  ExecutedNearlyFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<PE, ASF>;
      executionSteps: ExecutionSteps<PE, ESF>;
      refundSteps: RefundStep[];
    };
  };
};
