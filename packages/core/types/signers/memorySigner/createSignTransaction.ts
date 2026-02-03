import type {
  SignedTransaction,
  TransactionIntent,
} from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { ArgsInvalidSchema, Internal } from 'nat-types/natError';
import type { TaskQueueTimeout } from 'nat-types/signers/memorySigner/taskQueue';
import type {
  KeyPoolAccessKeysNotLoaded,
  KeyPoolEmpty,
  KeyPoolSigningKeyNotFound,
} from 'nat-types/signers/memorySigner/keyPool';

type Prefix = 'MemorySigner.SignTransaction';

export type SignTransactionIntentErrorVariant =
  | ArgsInvalidSchema<Prefix>
  | KeyPoolAccessKeysNotLoaded<Prefix>
  | KeyPoolEmpty<Prefix>
  | KeyPoolSigningKeyNotFound<Prefix>
  | TaskQueueTimeout<Prefix>
  | Internal<Prefix>;

export type SignTransactionIntentInternalErrorKind =
  'MemorySigner.SignTransaction.Internal';

type SignTransactionIntentArgs = {
  intent: TransactionIntent;
};

type SignTransactionIntentError =
  | NatError<'MemorySigner.SignTransaction.Args.InvalidSchema'>
  | NatError<'MemorySigner.SignTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'MemorySigner.SignTransaction.KeyPool.Empty'>
  | NatError<'MemorySigner.SignTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'MemorySigner.SignTransaction.TaskQueue.Timeout'>
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
