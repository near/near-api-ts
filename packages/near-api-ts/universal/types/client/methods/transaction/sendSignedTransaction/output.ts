import type { CryptoHash } from '../../../../_common/common';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../../_common/transactionDetails/deserializers';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
  TransactionProcessingStageMap,
} from '../../../../_common/transactionDetails/processingStage';
import type { ConversionStepSuccess } from '../../../../_common/transactionDetails/processingSteps/conversionStep/conversionStep';
import type { ExecutionSteps } from '../../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { RefundStep } from '../../../../_common/transactionDetails/processingSteps/refundStep';
import type { TransactionSuccessResultData } from '../../../../_common/transactionDetails/transactionResult';

export type TransactionDetailsAtStageConvertedOptimistic = {
  processingStage: TransactionProcessingStageMap['ConvertedOptimistic'];
  transactionHash: CryptoHash;
};

export type TransactionDetailsAtStageConvertedFinal<
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  processingStage: TransactionProcessingStageMap['ConvertedFinal'];
  transactionHash: CryptoHash;
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
  };
};

export type TransactionDetailsAtStageExecutedOptimistic<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  processingStage: TransactionProcessingStageMap['ExecutedOptimistic'];
  transactionHash: CryptoHash;
  data: TransactionSuccessResultData<RDF>;
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
  };
};

export type TransactionDetailsAtStageExecutedNearlyFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  processingStage: TransactionProcessingStageMap['ExecutedNearlyFinal'];
  transactionHash: CryptoHash;
  data: TransactionSuccessResultData<RDF>;
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
  };
};

export type TransactionDetailsAtStageCompletedFinal<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  processingStage: TransactionProcessingStageMap['CompletedFinal'];
  transactionHash: CryptoHash;
  data: TransactionSuccessResultData<RDF>;
  processingSteps: {
    conversionStep: ConversionStepSuccess<ASF>;
    executionSteps: ExecutionSteps<ESF>;
    refundSteps: RefundStep[];
  };
};

// Maps each processing stage to the concrete detail shape observed at exactly that stage.
// Every `TransactionDetailsAtStage*` carries a `processingStage` tag, so these remain distinct
// union members even where two shapes are otherwise structurally identical.
type TransactionDetailsByStage<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  ConvertedOptimistic: TransactionDetailsAtStageConvertedOptimistic;
  ConvertedFinal: TransactionDetailsAtStageConvertedFinal<ASF>;
  ExecutedOptimistic: TransactionDetailsAtStageExecutedOptimistic<RDF, ASF, ESF>;
  ExecutedNearlyFinal: TransactionDetailsAtStageExecutedNearlyFinal<RDF, ASF, ESF>;
  CompletedFinal: TransactionDetailsAtStageCompletedFinal<RDF, ASF, ESF>;
};

// Asking to wait for a minimal stage yields a union of that stage and every later reachable one,
// because by the time the RPC responds, the transaction may have progressed further.
export type TransactionDetailsFromStage<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  [S in TransactionProcessingStage]: TransactionDetailsByStage<
    RDF,
    ASF,
    ESF
  >[ReachableProcessingStageFromStage[S]];
};

export type SendSignedTransactionOutput<
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [TPS] extends [undefined]
  ? TransactionDetailsFromStage<RDF, ASF, ESF>['ExecutedOptimistic']
  : TransactionDetailsFromStage<RDF, ASF, ESF>[Exclude<TPS, undefined>];
