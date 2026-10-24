import type { NatError } from '../../../../src/_common/_common/_common/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { MaybeKeyIf } from '../../../utils';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';
import type {
  DeserializeActionSummariesFailedContext,
  DeserializeExecutionStepsFailedContext,
  TransactionDetailsInnerErrorRegistry,
} from './_common/innerErrorRegistry';
import type { RawTransactionActionSummary } from './_common/transactionDetails/_common/_common/actionSummaries';
import type {
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from './_common/transactionDetails/_common/_common/deserializers';
import type { RawExecutionStep } from './_common/transactionDetails/_common/executionStep';
import type { TransactionProcessingStageMap } from './_common/transactionDetails/_common/processingStage';
import type { ConversionFailure } from './_common/transactionDetails/conversionFailure';
import type { ExecutionFailure } from './_common/transactionDetails/executionFailure';
import type { ExecutionSuccess } from './_common/transactionDetails/executionSuccess';

export interface GetTransactionResultPublicErrorRegistry {
  'Client.GetTransactionResult.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetTransactionResult.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetTransactionResult.Timeout': TimeoutErrorContext;
  'Client.GetTransactionResult.Aborted': AbortedErrorContext;
  'Client.GetTransactionResult.Exhausted': ExhaustedErrorContext;
  'Client.GetTransactionResult.Rpc.Transaction.NotFound': {
    transactionHash: CryptoHash;
  };
  'Client.GetTransactionResult.Rpc.Transaction.NotCompleted': {
    transactionHash: CryptoHash;
    currentProcessingStage:
      | TransactionProcessingStageMap['ConvertedOptimistic']
      | TransactionProcessingStageMap['ConvertedFinal']
      | TransactionProcessingStageMap['ExecutedOptimistic']
      | TransactionProcessingStageMap['ExecutedNearlyFinal'];
  };
  'Client.GetTransactionResult.DeserializeResultData.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeResultData.Failed'];
  'Client.GetTransactionResult.DeserializeActionSummaries.Failed': DeserializeActionSummariesFailedContext<
    'Live' | 'Legacy'
  >;
  'Client.GetTransactionResult.DeserializeExecutionSteps.Failed': DeserializeExecutionStepsFailedContext<
    'Live' | 'Legacy'
  >;
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

// What each deserializer in `options` receives. A transaction read back from the chain may hold
// what older protocol versions recorded, so these hold data of every era - see `ProtocolEra`
export type GetTransactionResultDeserializeResultDataArgs = { rawData: Base64String };

export type GetTransactionResultDeserializeActionSummariesArgs = {
  rawActionSummaries: RawTransactionActionSummary<'Live' | 'Legacy'>[];
};

export type GetTransactionResultDeserializeExecutionStepsArgs = {
  rawExecutionSteps: RawExecutionStep<'Live' | 'Legacy'>[];
};

type MaybeDeserializeResultDataFn =
  | ((args: GetTransactionResultDeserializeResultDataArgs) => unknown)
  | undefined;

type MaybeDeserializeActionSummariesFn =
  | ((args: GetTransactionResultDeserializeActionSummariesArgs) => unknown)
  | undefined;

type MaybeDeserializeExecutionStepsFn =
  | ((args: GetTransactionResultDeserializeExecutionStepsArgs) => unknown)
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

export type GetTransactionResultArgs<
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
> = {
  transactionHash: CryptoHash;
} & Options<RDF, ASF, ESF>;

export type GetTransactionResultOutput<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn<'Live' | 'Legacy'> = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn<'Live' | 'Legacy'> = undefined,
> =
  | ConversionFailure<'Live' | 'Legacy', ASF>['CompletedFinal']
  | ExecutionFailure<'Live' | 'Legacy', ASF, ESF>['CompletedFinal']
  | ExecutionSuccess<'Live' | 'Legacy', RDF, ASF, ESF>['CompletedFinal'];

export type GetTransactionResultError =
  | NatError<'Client.GetTransactionResult.Args.InvalidSchema'>
  | NatError<'Client.GetTransactionResult.PreferredRpc.NotFound'>
  | NatError<'Client.GetTransactionResult.Timeout'>
  | NatError<'Client.GetTransactionResult.Aborted'>
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotFound'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeActionSummaries.Failed'>
  | NatError<'Client.GetTransactionResult.DeserializeExecutionSteps.Failed'>
  | NatError<'Client.GetTransactionResult.Internal'>;

// The deserializer type params default to `MaybeDeserialize…Fn`, not `undefined`: TS checks a call
// against the defaults before it types an inline deserializer, and `undefined` poisons its key.
export type SafeGetTransactionResult = <
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<Result<GetTransactionResultOutput<RDF, ASF, ESF>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RDF extends MaybeDeserializeResultDataFn = MaybeDeserializeResultDataFn,
  ASF extends MaybeDeserializeActionSummariesFn = MaybeDeserializeActionSummariesFn,
  ESF extends MaybeDeserializeExecutionStepsFn = MaybeDeserializeExecutionStepsFn,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<GetTransactionResultOutput<RDF, ASF, ESF>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
