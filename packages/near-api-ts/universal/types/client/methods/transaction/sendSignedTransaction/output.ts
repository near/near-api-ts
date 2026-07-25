import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../../_common/transactionDetails/_common/_common/deserializers';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
} from '../../../../_common/transactionDetails/_common/processingStage';
import type { ConversionSuccess } from '../../../../_common/transactionDetails/conversionSuccess';
import type { ExecutionSuccess } from '../../../../_common/transactionDetails/executionSuccess';

// Maps each processing stage to the concrete detail shape observed at exactly that stage.
// Every `TransactionDetailsAtStage*` carries a `processingStage` tag, so these remain distinct
// union members even where two shapes are otherwise structurally identical.
export type TransactionDetailsAtStage<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  ConvertedOptimistic: ConversionSuccess['ConvertedOptimistic'];
  ConvertedFinal: ConversionSuccess<ASF>['ConvertedFinal'];
  ExecutedOptimistic: ExecutionSuccess<RDF, ASF, ESF>['ExecutedOptimistic'];
  ExecutedNearlyFinal: ExecutionSuccess<RDF, ASF, ESF>['ExecutedNearlyFinal'];
  CompletedFinal: ExecutionSuccess<RDF, ASF, ESF>['CompletedFinal'];
};

// Asking to wait for a minimal stage yields a union of that stage and every later reachable one,
// because by the time the RPC responds, the transaction may have progressed further.
export type TransactionDetailsFromStage<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  [S in TransactionProcessingStage]: TransactionDetailsAtStage<
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
