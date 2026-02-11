import type {
  SignedTransaction,
  TransactionIntent,
} from '../../transaction';
import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { MemorySignerContext } from './memorySigner';
import type { ArgsInvalidSchema, Internal } from '../../natError';
import type { TaskQueueTimeout } from './taskQueue';
import type {
  KeyPoolAccessKeysNotLoaded,
  KeyPoolEmpty,
  KeyPoolSigningKeyNotFound,
} from './keyPool';

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
