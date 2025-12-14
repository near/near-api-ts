import type {
  SignedTransaction,
  TransactionIntent,
} from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from 'nat-types/natError';
import type { AccessTypePriority } from 'nat-types/signers/memorySigner/taskQueue';

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
  | NatError<'MemorySigner.ExecuteTransaction.Internal'>;

export type SafeExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<
  Result<SignedTransaction, ExecuteTransactionError>
>;

export type ExecuteTransaction = (
  args: ExecuteTransactionArgs,
) => Promise<SignedTransaction>;

export type CreateSafeExecuteTransaction = (
  context: MemorySignerContext,
) => SafeExecuteTransaction;
