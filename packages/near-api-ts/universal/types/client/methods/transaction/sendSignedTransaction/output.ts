import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../_common/transactionDetails/_common/_common/deserializers';
import type { ProtocolEra } from '../_common/transactionDetails/_common/_common/protocolEra';
import type {
  MaybeTransactionProcessingStage,
  ReachableProcessingStageFromStage,
  TransactionProcessingStage,
} from '../_common/transactionDetails/_common/processingStage';
import type { ConversionSuccess } from '../_common/transactionDetails/conversionSuccess';
import type { ExecutionSuccess } from '../_common/transactionDetails/executionSuccess';

// Maps each processing stage to the concrete detail shape observed at exactly that stage.
// Every `TransactionDetailsAtStage*` carries a `processingStage` tag, so these remain distinct
// union members even where two shapes are otherwise structurally identical.
// `PE` is `'Live'` everywhere but in the builders the methods share, which read any transaction.
export type TransactionDetailsAtStage<
  PE extends ProtocolEra,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
> = {
  ConvertedOptimistic: ConversionSuccess<PE>['ConvertedOptimistic'];
  ConvertedFinal: ConversionSuccess<PE, ASF>['ConvertedFinal'];
  ExecutedOptimistic: ExecutionSuccess<PE, RDF, ASF, ESF>['ExecutedOptimistic'];
  ExecutedNearlyFinal: ExecutionSuccess<PE, RDF, ASF, ESF>['ExecutedNearlyFinal'];
  CompletedFinal: ExecutionSuccess<PE, RDF, ASF, ESF>['CompletedFinal'];
};

// Asking to wait for a minimal stage yields a union of that stage and every later reachable one,
// because by the time the RPC responds, the transaction may have progressed further.
export type TransactionDetailsFromStage<
  PE extends ProtocolEra,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<PE> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<PE> = undefined,
> = {
  [S in TransactionProcessingStage]: TransactionDetailsAtStage<
    PE,
    RDF,
    ASF,
    ESF
  >[ReachableProcessingStageFromStage[S]];
};

export type SendSignedTransactionOutput<
  TPS extends MaybeTransactionProcessingStage = undefined,
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live'> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live'> = undefined,
> = [TPS] extends [undefined]
  ? TransactionDetailsFromStage<'Live', RDF, ASF, ESF>['ExecutedOptimistic']
  : TransactionDetailsFromStage<'Live', RDF, ASF, ESF>[Exclude<TPS, undefined>];
