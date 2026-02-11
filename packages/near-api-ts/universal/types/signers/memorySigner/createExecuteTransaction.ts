import type { TransactionIntent } from '../../transaction';
import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { MemorySignerContext } from './memorySigner';
import type { ArgsInvalidSchema, Internal } from '../../natError';
import type { TaskQueueTimeout } from './taskQueue';
import type { SendSignedTransactionOutput } from '../../client/methods/transaction/sendSignedTransaction';
import type { SharedTransactionErrorVariant } from '../../_common/sharedTransactionErrors';
import type { SendRequestError } from '../../client/transport/sendRequest';
import type {
  KeyPoolAccessKeysNotLoaded,
  KeyPoolEmpty,
  KeyPoolSigningKeyNotFound,
} from './keyPool';

type Prefix = 'MemorySigner.ExecuteTransaction';

export type ExecuteTransactionErrorVariant =
  | SharedTransactionErrorVariant<Prefix>
  | ArgsInvalidSchema<Prefix>
  | KeyPoolAccessKeysNotLoaded<Prefix>
  | KeyPoolEmpty<Prefix>
  | KeyPoolSigningKeyNotFound<Prefix>
  | TaskQueueTimeout<Prefix>
  | {
      kind: `MemorySigner.ExecuteTransaction.SendRequest.Failed`; // TODO Unpack
      context: { cause: SendRequestError };
    }
  | Internal<Prefix>;

export type ExecuteTransactionInternalErrorKind =
  'MemorySigner.ExecuteTransaction.Internal';

type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

type ExecuteTransactionError =
  | NatError<'MemorySigner.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.Empty'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.TaskQueue.Timeout'>
  | NatError<'MemorySigner.ExecuteTransaction.SendRequest.Failed'>
  // RPC errors
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Signer.Balance.TooLow'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Receiver.NotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Timeout'>
  // Rpc transaction action errors
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.BelowThreshold'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow'>
  | NatError<'MemorySigner.ExecuteTransaction.Rpc.Transaction.Action.Stake.NotFound'>
  // Stub
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<Result<SendSignedTransactionOutput, ExecuteTransactionError>>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SendSignedTransactionOutput>;

export type CreateSafeExecuteTransaction = (
  context: MemorySignerContext,
) => SafeExecuteTransaction;
