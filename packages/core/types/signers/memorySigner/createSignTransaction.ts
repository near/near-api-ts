import type {
  SignedTransaction,
  TransactionIntent,
} from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Milliseconds, Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  InternalErrorContext,
  InvalidSchemaContext,
} from 'nat-types/natError';
import type { AccessTypePriority } from 'nat-types/signers/memorySigner/taskQueue';

export type SignTransactionIntentErrorVariant =
  | {
      kind: `MemorySigner.SignTransaction.Args.InvalidSchema`;
      context: InvalidSchemaContext;
    }
  | {
      kind: 'MemorySigner.SignTransaction.KeyForTaskNotFound';
      context: {
        accessTypePriority: AccessTypePriority;
      };
    }
  | {
      kind: 'MemorySigner.SignTransaction.MaxTimeInQueueReached';
      context: {
        maxWaitInQueueMs: Milliseconds;
      };
    }
  | {
      kind: `MemorySigner.SignTransaction.Internal`;
      context: InternalErrorContext;
    };

export type SignTransactionIntentInternalErrorKind =
  'MemorySigner.SignTransaction.Internal';

type SignTransactionIntentArgs = {
  intent: TransactionIntent;
};

type SignTransactionIntentError =
  | NatError<'MemorySigner.SignTransaction.Args.InvalidSchema'>
  | NatError<'MemorySigner.SignTransaction.KeyForTaskNotFound'>
  | NatError<'MemorySigner.SignTransaction.MaxTimeInQueueReached'> // TODO change to .Task.MaxTimeInQueueReached
  | NatError<'MemorySigner.SignTransaction.Internal'>;

export type SafeSignTransactionIntent = (
  args: SignTransactionIntentArgs,
) => Promise<Result<SignedTransaction, SignTransactionIntentError>>;

export type SignTransactionIntent = (
  args: SignTransactionIntentArgs,
) => Promise<SignedTransaction>;

export type CreateSafeSignTransaction = (
  context: MemorySignerContext,
) => SafeSignTransactionIntent;
