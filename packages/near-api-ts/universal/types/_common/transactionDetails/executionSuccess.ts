import type { CryptoHash } from '../common';
import type {
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from './_common/_common/deserializers';
import type { ConversionStepSuccess } from './_common/conversionStep';
import type { ExecutionSteps } from './_common/executionStep';
import type { TransactionProcessingStageMap } from './_common/processingStage';
import type { RefundStep } from './_common/refundStep';

// `data` is a return type of custom deserializer (passed by user) or unknown;
export type TransactionResultData<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
> = [RDF] extends [BaseDeserializeTransactionResultDataFn] ? ReturnType<RDF> : unknown;

export type ExecutionSuccess<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  ExecutedOptimistic: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
  ExecutedNearlyFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
    };
  };
  CompletedFinal: {
    transactionHash: CryptoHash;
    processingStage: TransactionProcessingStageMap['CompletedFinal'];
    status: 'ExecutionSuccess';
    data: TransactionResultData<RDF>;
    processingSteps: {
      conversionStep: ConversionStepSuccess<ASF>;
      executionSteps: ExecutionSteps<ESF>;
      refundSteps: RefundStep[];
    };
  };
};
