import type { NatError } from '../../../../src/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { RawActionSummary } from '../../../_common/transactionDetails/actionSummaries';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
} from '../../../_common/transactionDetails/deserializers';
import type { TransactionProcessingStageMap } from '../../../_common/transactionDetails/processingStage';
import type { RawExecutionStep } from '../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type { TransactionResult } from '../../../_common/transactionDetails/transactionResult';
import type { KeyIf } from '../../../utils';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';
import type { TransactionDetailsInnerErrorRegistry } from './_common/innerErrorRegistry';

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
  'Client.GetTransactionResult.DeserializeActionSummaries.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeActionSummaries.Failed'];
  'Client.GetTransactionResult.DeserializeExecutionSteps.Failed': TransactionDetailsInnerErrorRegistry['Inner.Client.TransactionDetails.DeserializeExecutionSteps.Failed'];
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

type Options<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [RDF, ASF, ESF] extends [undefined, undefined, undefined]
  ? {
      options?: {
        signal?: AbortSignal;
        deserializeResultData?: never;
        deserializeActionSummaries?: never;
        deserializeExecutionSteps?: never;
      };
    }
  : {
      options: { signal?: AbortSignal } & KeyIf<'deserializeResultData', RDF> &
        KeyIf<'deserializeActionSummaries', ASF> &
        KeyIf<'deserializeExecutionSteps', ESF>;
    };

export type GetTransactionResultArgs<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
} & Options<RDF, ASF, ESF>;

// Inside the implementation function we don't care about the particular deserializer result and
// treat it as unknown data;
export type InnerGetTransactionResultArgs = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
    deserializeResultData?: BaseDeserializeTransactionResultDataFn;
    deserializeActionSummaries?: BaseDeserializeTransactionActionSummariesFn;
    deserializeExecutionSteps?: BaseDeserializeTransactionExecutionStepsFn;
  };
};

export type GetTransactionResultOutput<
  RDF extends MaybeBaseDeserializeTransactionResultDataFn,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = TransactionResult<RDF, ASF, ESF>;

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

export type SafeGetTransactionResult = <
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<Result<GetTransactionResultOutput<RDF, ASF, ESF>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RDF extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  ASF extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ESF extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RDF, ASF, ESF>,
) => Promise<GetTransactionResultOutput<RDF, ASF, ESF>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
