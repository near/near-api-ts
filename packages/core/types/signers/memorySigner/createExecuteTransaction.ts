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

export type ExecuteTransactionErrorVariant =
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
      kind: 'MemorySigner.ExecuteTransaction.MaxTimeInTaskQueueReached';
      context: {
        maxWaitInQueueMs: Milliseconds;
      };
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
  | NatError<'MemorySigner.ExecuteTransaction.MaxTimeInTaskQueueReached'>
  // rpc errors
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
