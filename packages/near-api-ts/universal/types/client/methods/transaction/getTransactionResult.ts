import type { NatError } from '../../../../src/_common/natError';
import type { Base64String, CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type {
  BaseDeserializeTransactionResultDataFn,
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
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

type Options<RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined> = [RD] extends [
  undefined,
]
  ? {
      options?: {
        signal?: AbortSignal;
        deserializeResultData?: never;
      };
    }
  : {
      options: { signal?: AbortSignal } & KeyIf<'deserializeResultData', RD>;
    };

export type GetTransactionResultArgs<
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
> = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
} & Options<RD>;

export type InnerGetTransactionResultArgs = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
    deserializeResultData?: BaseDeserializeTransactionResultDataFn;
  };
};

export type GetTransactionResultOutput<RD extends MaybeBaseDeserializeTransactionResultDataFn> =
  TransactionResult<RD>;

export type GetTransactionResultError =
  | NatError<'Client.GetTransactionResult.Args.InvalidSchema'>
  | NatError<'Client.GetTransactionResult.PreferredRpc.NotFound'>
  | NatError<'Client.GetTransactionResult.Timeout'>
  | NatError<'Client.GetTransactionResult.Aborted'>
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotFound'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Client.GetTransactionResult.DeserializeResultData.Failed'>
  | NatError<'Client.GetTransactionResult.Internal'>;

export type SafeGetTransactionResult = <
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
>(
  args: GetTransactionResultArgs<RD>,
) => Promise<Result<GetTransactionResultOutput<RD>, GetTransactionResultError>>;

export type GetTransactionResult = <
  RD extends MaybeBaseDeserializeTransactionResultDataFn = undefined,
>(
  args: GetTransactionResultArgs<RD>,
) => Promise<GetTransactionResultOutput<RD>>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
