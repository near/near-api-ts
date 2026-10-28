import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../_common/natError';
import type { SignTransactionOutput } from '../../_common/transaction/signTransaction';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type { SignerErrorContext } from '../_common/errorContext';
import type { SignerContext } from '../signer';

export interface SignTransactionPublicErrorRegistry {
  'Signer.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Signer.SignTransaction.KeyPool.AccessKeys.NotLoaded': SignerErrorContext['KeyPool']['AccessKeys']['NotLoaded'];
  'Signer.SignTransaction.KeyPool.Empty': SignerErrorContext['KeyPool']['Empty'];
  'Signer.SignTransaction.KeyPool.SigningKey.NotFound': SignerErrorContext['KeyPool']['SigningKey']['NotFound'];
  'Signer.SignTransaction.TaskQueue.Timeout': SignerErrorContext['TaskQueue']['Timeout'];
  'Signer.SignTransaction.Internal': InternalErrorContext;
}

type SignTransactionIntentArgs = {
  intent: TransactionIntent;
};

type SignTransactionIntentError =
  | NatError<'Signer.SignTransaction.Args.InvalidSchema'>
  | NatError<'Signer.SignTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.SignTransaction.KeyPool.Empty'>
  | NatError<'Signer.SignTransaction.KeyPool.SigningKey.NotFound'>
  | NatError<'Signer.SignTransaction.TaskQueue.Timeout'>
  | NatError<'Signer.SignTransaction.Internal'>;

export type SafeSignTransactionIntent = (
  args: SignTransactionIntentArgs,
) => Promise<Result<SignTransactionOutput, SignTransactionIntentError>>;

export type SignTransactionIntent = (
  args: SignTransactionIntentArgs,
) => Promise<SignTransactionOutput>;

export type CreateSafeSignTransaction = (context: SignerContext) => SafeSignTransactionIntent;
