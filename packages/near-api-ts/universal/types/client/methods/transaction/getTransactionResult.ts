import type { NatError } from '../../../../src/_common/natError';
import type { CryptoHash, Result } from '../../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../../_common/natError';
import type { TransactionErrorContext } from '../../../_common/transaction/rpcTransactionErrorContext';
import type { TransactionResult } from '../../../_common/transactionDetails/transactionResult';
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
  'Client.GetTransactionResult.Internal': InternalErrorContext;
}

export type GetTransactionResultArgs = {
  transactionHash: CryptoHash;
  policies?: {
    transport?: PartialTransportPolicy;
  };
  options?: {
    signal?: AbortSignal;
  };
};

export type GetTransactionResultOutput = TransactionResult;

export type GetTransactionResultError =
  | NatError<'Client.GetTransactionResult.Args.InvalidSchema'>
  | NatError<'Client.GetTransactionResult.PreferredRpc.NotFound'>
  | NatError<'Client.GetTransactionResult.Timeout'>
  | NatError<'Client.GetTransactionResult.Aborted'>
  | NatError<'Client.GetTransactionResult.Exhausted'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotFound'>
  | NatError<'Client.GetTransactionResult.Rpc.Transaction.NotCompleted'>
  | NatError<'Client.GetTransactionResult.Internal'>;

export type SafeGetTransactionResult = (
  args: GetTransactionResultArgs,
) => Promise<Result<GetTransactionResultOutput, GetTransactionResultError>>;

export type GetTransactionResult = (
  args: GetTransactionResultArgs,
) => Promise<GetTransactionResultOutput>;

export type CreateSafeGetTransactionResult = (
  clientContext: ClientContext,
) => SafeGetTransactionResult;
