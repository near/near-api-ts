import type { NatError } from '../../../src/_common/_common/_common/_common/natError';
import type { Result } from '../../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../_common/natError';
import type { SignTransactionOutput } from '../../_common/transaction/signTransaction';
import type { TransactionIntent } from '../../_common/transaction/transaction';
import type { KeyPoolInnerErrorRegistry } from '../inner/keyPool';
import type { TaskQueueInnerErrorRegistry } from '../inner/taskQueue';
import type { SignerContext } from '../signer';

export interface SignTransactionPublicErrorRegistry {
  'Signer.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'Signer.SignTransaction.KeyPool.AccessKeys.NotLoaded': KeyPoolInnerErrorRegistry['Signer.KeyPool.AccessKeys.NotLoaded'];
  'Signer.SignTransaction.KeyPool.Empty': KeyPoolInnerErrorRegistry['Signer.KeyPool.Empty'];
  'Signer.SignTransaction.KeyPool.SignService.Failed': KeyPoolInnerErrorRegistry['Signer.KeyPool.SignService.Failed'];
  'Signer.SignTransaction.KeyPool.SigningKey.NotFound': KeyPoolInnerErrorRegistry['Signer.KeyPool.SigningKey.NotFound'];
  'Signer.SignTransaction.TaskQueue.Timeout': TaskQueueInnerErrorRegistry['Signer.TaskQueue.Timeout'];
  'Signer.SignTransaction.Internal': InternalErrorContext;
}

type SignTransactionIntentArgs = {
  intent: TransactionIntent;
};

type SignTransactionIntentError =
  | NatError<'Signer.SignTransaction.Args.InvalidSchema'>
  | NatError<'Signer.SignTransaction.KeyPool.AccessKeys.NotLoaded'>
  | NatError<'Signer.SignTransaction.KeyPool.Empty'>
  | NatError<'Signer.SignTransaction.KeyPool.SignService.Failed'>
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
