import type { TransactionIntent } from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { ArgsInvalidSchema, Internal } from 'nat-types/natError';
import type { TaskQueueTimeout } from 'nat-types/signers/memorySigner/taskQueue';
import type { SendSignedTransactionOutput } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { SharedTransactionErrorVariant } from 'nat-types/_common/sharedTransactionErrors';
import type { SendRequestError } from 'nat-types/client/transport/sendRequest';
import type {
  KeyPoolAccessKeysNotLoaded,
  KeyPoolEmpty,
  KeyPoolSigningKeyNotFound,
} from 'nat-types/signers/memorySigner/keyPool';

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
