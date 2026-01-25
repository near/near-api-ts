import type { TransactionIntent } from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Milliseconds, Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from 'nat-types/natError';
import type { AccessTypePriority } from 'nat-types/signers/memorySigner/taskQueue';
import type { SendSignedTransactionOutput } from 'nat-types/client/methods/transaction/sendSignedTransaction';
import type { SharedTransactionErrorVariant } from 'nat-types/_common/sharedTransactionErrors';
import type { SendRequestError } from 'nat-types/client/transport/sendRequest';

export type ExecuteTransactionErrorVariant =
  | SharedTransactionErrorVariant<'MemorySigner.ExecuteTransaction'>
  | {
      kind: `MemorySigner.ExecuteTransaction.Args.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: 'MemorySigner.ExecuteTransaction.KeyForTaskNotFound';
      context: {
        accessTypePriority: AccessTypePriority;
      };
    }
  | {
      kind: 'MemorySigner.ExecuteTransaction.MaxTimeInQueueReached';
      context: {
        maxWaitInQueueMs: Milliseconds;
      };
    }
  | {
      kind: `MemorySigner.ExecuteTransaction.SendRequest.Failed`;
      context: { cause: SendRequestError };
    }
  | {
      kind: `MemorySigner.ExecuteTransaction.Internal`;
      context: InternalErrorContext;
    };

export type ExecuteTransactionInternalErrorKind =
  'MemorySigner.ExecuteTransaction.Internal';

type ExecuteTransactionArgs = {
  intent: TransactionIntent;
};

type ExecuteTransactionError =
  | NatError<'MemorySigner.ExecuteTransaction.Args.InvalidSchema'>
  | NatError<'MemorySigner.ExecuteTransaction.KeyForTaskNotFound'>
  | NatError<'MemorySigner.ExecuteTransaction.MaxTimeInQueueReached'>
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
