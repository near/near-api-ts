import type { Base64String, TransactionHash } from '../../../../_common/common';
import type { KeyIf, MaybeKeyIf } from '../../../../utils';
import type { PartialTransportPolicy } from '../../../transport/transport';
import type { RawTransactionActionSummary } from '../_common/transactionDetails/_common/_common/actionSummaries';
import type { RawExecutionStep } from '../_common/transactionDetails/_common/executionStep';
import type { MaybeTransactionProcessingStage } from '../_common/transactionDetails/_common/processingStage';

// What each deserializer in `options` receives. A transaction sent now holds only what the current
// protocol produces, so these are `'Live'` - see `ProtocolEra`
export type SendSignedTransactionDeserializeResultDataArgs = { rawData: Base64String };

export type SendSignedTransactionDeserializeActionSummariesArgs = {
  rawActionSummaries: RawTransactionActionSummary<'Live'>[];
};

export type SendSignedTransactionDeserializeExecutionStepsArgs = {
  rawExecutionSteps: RawExecutionStep<'Live'>[];
};

export type MaybeDeserializeResultDataFn =
  | ((args: SendSignedTransactionDeserializeResultDataArgs) => unknown)
  | undefined;

export type MaybeDeserializeActionSummariesFn =
  | ((args: SendSignedTransactionDeserializeActionSummariesArgs) => unknown)
  | undefined;

export type MaybeDeserializeExecutionStepsFn =
  | ((args: SendSignedTransactionDeserializeExecutionStepsArgs) => unknown)
  | undefined;

// A deserializer type param is `undefined` when pinned to it explicitly (its key is poisoned), its
// `MaybeDeserialize…Fn` default while nothing is inferred for it (its key is optional and types an
// inline deserializer's parameter), or the deserializer's own type (its key is required).
type OptionsObject<
  RDF extends MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn,
> = {
  transportPolicy?: PartialTransportPolicy;
  signal?: AbortSignal;
} & MaybeKeyIf<'deserializeResultData', RDF> &
  MaybeKeyIf<'deserializeActionSummaries', ASF> &
  MaybeKeyIf<'deserializeExecutionSteps', ESF>;

// `options` is required as soon as one of its deserializer keys is.
type Options<
  RDF extends MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn,
> = [undefined, undefined, undefined] extends [RDF, ASF, ESF]
  ? { options?: OptionsObject<RDF, ASF, ESF> }
  : { options: OptionsObject<RDF, ASF, ESF> };

// What a transaction is sent with besides itself - executeTransaction, which signs the transaction
// on its own, takes the same
export type TransactionSendingArgs<
  TPS extends MaybeTransactionProcessingStage,
  RDF extends MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn,
> = KeyIf<'minimalProcessingStage', TPS> & Options<RDF, ASF, ESF>;

export type SendSignedTransactionArgs<
  TPS extends MaybeTransactionProcessingStage,
  RDF extends MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn,
> = {
  signedTransaction: {
    signedTransactionBorsh64: Base64String;
    transactionHash: TransactionHash;
  };
} & TransactionSendingArgs<TPS, RDF, ASF, ESF>;
