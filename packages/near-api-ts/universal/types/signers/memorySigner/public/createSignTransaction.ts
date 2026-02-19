import type {
  SignedTransaction,
  TransactionIntent,
} from '../../../_common/transaction/transaction';
import type { NatError } from '../../../../src/_common/natError';
import type { Result } from '../../../_common/common';
import type { MemorySignerContext } from '../memorySigner';
import type {
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../../natError';
import type { MemorySignerErrorContext } from '@universal/types/signers/memorySigner/_common/errorContext';

export interface SignTransactionPublicErrorRegistry {
  'MemorySigner.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemorySigner.SignTransaction.KeyPool.AccessKeys.NotLoaded': MemorySignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'MemorySigner.SignTransaction.KeyPool.Empty': MemorySignerErrorContext['KeyPool']['Empty'];
  'MemorySigner.SignTransaction.KeyPool.SigningKey.NotFound': MemorySignerErrorContext['KeyPool']['SigningKey']['NotFound'];
  'MemorySigner.SignTransaction.TaskQueue.Timeout': MemorySignerErrorContext['TaskQueue']['Timeout'];
  'MemorySigner.SignTransaction.Internal': InternalErrorContext;
}

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
