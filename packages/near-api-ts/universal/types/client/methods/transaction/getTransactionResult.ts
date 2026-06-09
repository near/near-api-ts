import type { ActionView } from '@near-js/jsonrpc-types';
import type { NatError } from '../../../../src/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type {
  BaseDeserializeTransactionActionSummariesFn,
  BaseDeserializeTransactionResultDataFn,
  MaybeBaseDeserializeTransactionActionSummariesFn,
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
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

type Options<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = [RD, AS] extends [undefined, undefined]
  ? {
      options?: {
        signal?: AbortSignal;
        deserializeResultData?: never;
        deserializeActionSummaries?: never;
      };
    }
  : {
      options: { signal?: AbortSignal } & KeyIf<'deserializeResultData', RD> &
        KeyIf<'deserializeActionSummaries', AS>;
    };

export type GetTransactionResultArgs<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
> = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
} & Options<RD, AS>;

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
  };
};

export type GetTransactionResultOutput<
  RD extends MaybeBaseDeserializeTransactionResultDataFn,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn,
> = TransactionResult<RD, AS>;

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
  | NatError<'Client.GetTransactionResult.Internal'>;

export type SafeGetTransactionResult = <
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
>(
  args: GetTransactionResultArgs<RD, AS>,
) => Promise<Result<GetTransactionResultOutput<RD, AS>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
  AS extends MaybeBaseDeserializeTransactionActionSummariesFn = undefined,
>(
  args: GetTransactionResultArgs<RD, AS>,
) => Promise<GetTransactionResultOutput<RD, AS>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
