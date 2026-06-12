import type { ActionView } from '@near-js/jsonrpc-types';
import type { NatError } from '../../../../src/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type { RawExecutionStep } from '../../../_common/transactionDetails/processingSteps/executionStep';
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
    data: Base64String;
  };
  'Client.GetTransactionResult.DeserializeActionSummaries.Failed': {
    cause: unknown;
    rawActionSummaries: ActionView[];
  };
  'Client.GetTransactionResult.DeserializeExecutionSteps.Failed': {
    cause: unknown;
    rawExecutionSteps: RawExecutionStep[];
  };
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

type Options<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = [RD, AS, ES] extends [undefined, undefined, undefined]
  ? {
      options?: {
        signal?: AbortSignal;
        deserializeResultData?: never;
        deserializeActionSummaries?: never;
        deserializeExecutionSteps?: never;
      };
    }
  : {
      options: { signal?: AbortSignal } & KeyIf<'deserializeResultData', RD> &
        KeyIf<'deserializeActionSummaries', AS> &
        KeyIf<'deserializeExecutionSteps', ES>;
    };

export type GetTransactionResultArgs<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
> = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
} & Options<RD, AS, ES>;

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
  RD extends MaybeBaseDeserializeTransactionResultDataFn,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn,
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn,
> = TransactionResult<RD, AS, ES>;

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
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RD, AS, ES>,
) => Promise<Result<GetTransactionResultOutput<RD, AS, ES>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
  ES extends MaybeBaseDeserializeTransactionExecutionStepsFn = undefined,
>(
  args: GetTransactionResultArgs<RD, AS, ES>,
) => Promise<GetTransactionResultOutput<RD, AS, ES>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
