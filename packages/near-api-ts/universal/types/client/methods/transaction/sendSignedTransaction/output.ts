import type { CryptoHash } from '../../../../_common/common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../../_common/transactionDetails/deserializers';
import type {
  MaybeTransactionProcessingStage,
  TransactionProcessingStageMap,
} from '../../../../_common/transactionDetails/processingStage';
import type { ConversionStepSuccess } from '../../../../_common/transactionDetails/processingSteps/conversionStep';
import type { ExecutionSteps } from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RefundStep } from '../../../../_common/transactionDetails/processingSteps/refundStep';
import type { TransactionSuccessResultData } from '../../../../_common/transactionDetails/transactionResult';

export type TransactionDetailsAtStageConvertedOptimistic = {
  processingStage: TransactionProcessingStageMap['ConvertedOptimistic'];
  transactionHash: CryptoHash;
};

export type TransactionDetailsAtStageConvertedFinal<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
> = {
  processingStage: TransactionProcessingStageMap['ConvertedFinal'];
  transactionHash: CryptoHash;
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
  };
};

export type TransactionDetailsAtStageExecutedOptimistic<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
  transactionHash: CryptoHash;
  result: {
    data: TransactionSuccessResultData<RDF>;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
  };
};

export type TransactionDetailsAtStageExecutedNearlyFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
  transactionHash: CryptoHash;
  result: {
    data: TransactionSuccessResultData<RDF>;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
  };
};

export type TransactionDetailsAtStageCompletedFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  processingStage: TransactionProcessingStageMap['CompletedFinal'];
  transactionHash: CryptoHash;
  result: {
    data: TransactionSuccessResultData<RDF>;
  };
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
    refundSteps: RefundStep[];
  };
};

export type TransactionDetailsFromStageConvertedOptimistic<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> =
  | TransactionDetailsAtStageConvertedOptimistic
  | TransactionDetailsAtStageConvertedFinal<ASF>
  | TransactionDetailsAtStageExecutedOptimistic<RDF, ASF, ESF>
  | TransactionDetailsAtStageExecutedNearlyFinal<RDF, ASF, ESF>
  | TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;

export type TransactionDetailsFromStageConvertedFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> =
  | TransactionDetailsAtStageConvertedFinal<ASF>
  | TransactionDetailsAtStageExecutedNearlyFinal<RDF, ASF, ESF>
  | TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;

export type TransactionDetailsFromStageExecutedOptimistic<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> =
  | TransactionDetailsAtStageExecutedOptimistic<RDF, ASF, ESF>
  | TransactionDetailsAtStageExecutedNearlyFinal<RDF, ASF, ESF>
  | TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;

export type TransactionDetailsFromStageExecutedNearlyFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> =
  | TransactionDetailsAtStageExecutedNearlyFinal<RDF, ASF, ESF>
  | TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;

export type TransactionDetailsFromStageCompletedFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;

export type TransactionDetailsFromStage<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = {
  ConvertedOptimistic: TransactionDetailsFromStageConvertedOptimistic<RDF, ASF, ESF>;
  ConvertedFinal: TransactionDetailsFromStageConvertedFinal<RDF, ASF, ESF>;
  ExecutedOptimistic: TransactionDetailsFromStageExecutedOptimistic<RDF, ASF, ESF>;
  ExecutedNearlyFinal: TransactionDetailsFromStageExecutedNearlyFinal<RDF, ASF, ESF>;
  CompletedFinal: TransactionDetailsFromStageCompletedFinal<RDF, ASF, ESF>;
};

export type SendSignedTransactionOutput<
  TPS extends MaybeTransactionProcessingStage,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = [TPS] extends [undefined]
  ? TransactionDetailsFromStage<RDF, ASF, ESF>['ExecutedOptimistic']
  : TransactionDetailsFromStage<RDF, ASF, ESF>[Exclude<TPS, undefined>];
