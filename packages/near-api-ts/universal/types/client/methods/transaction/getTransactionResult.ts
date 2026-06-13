import type { NatError } from '../../../../src/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type { RawActionSummary } from '../../../_common/transactionDetails/actionSummaries';
import type { RawExecutionStep } from '../../../_common/transactionDetails/processingSteps/executionSteps/executionStep';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionExecutionStepsFn,
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
  MaybeBaseDeserializeTransactionExecutionStepsFn,
  MaybeBaseDeserializeTransactionResultDataFn,
  TransactionResult,
} from '../../../_common/transactionDetails/transactionResult';
import type { KeyIf } from '../../../utils';
import type { ClientContext } from '../../client';
import type {
  AbortedErrorContext,
  ExhaustedErrorContext,
  PreferredRpcNotFoundErrorContext,
  TimeoutErrorContext,
} from '../../transport/sendRequest';
import type { PartialTransportPolicy } from '../../transport/transport';

export interface GetTransactionResultPublicErrorRegistry {
  'Client.GetTransactionResult.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Client.GetTransactionResult.PreferredRpc.NotFound': PreferredRpcNotFoundErrorContext;
  'Client.GetTransactionResult.Timeout': TimeoutErrorContext;
  'Client.GetTransactionResult.Aborted': AbortedErrorContext;
  'Client.GetTransactionResult.Exhausted': ExhaustedErrorContext;
  'Client.GetTransactionResult.Rpc.Transaction.NotFound': TransactionErrorContext['NotFound'];
  'Client.GetTransactionResult.Rpc.Transaction.NotCompleted': TransactionErrorContext['NotCompleted'];
  'Client.GetTransactionResult.DeserializeResultData.Failed': {
    cause: unknown;
    rawData: Base64String;
  };
  'Client.GetTransactionResult.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: RawActionSummary[];
  };
  'Client.GetTransactionResult.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
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
