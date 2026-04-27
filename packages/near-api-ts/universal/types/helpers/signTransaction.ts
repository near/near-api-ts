import type { NatError } from '../../src/_common/natError';
import type { Result } from '../_common/common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { SafeSignData } from '../_common/signData';
import type { SignedTransaction, Transaction } from '../_common/transaction/transaction';

export interface SignTransactionPublicErrorRegistry {
  'SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'SignTransaction.Internal': InternalErrorContext;
}

export type SignTransactionArgs<TSignDataError = unknown> = {
  signDataProvider: { safeSignData: SafeSignData<TSignDataError> };
  transaction: Transaction;
};

type SignTransactionError<TSignDataError> =
  | TSignDataError // TODO pack into SignTransaction.SignData.Failed
  | NatError<'SignTransaction.Args.InvalidSchema'>
  | NatError<'SignTransaction.Internal'>;

export type SafeSignTransaction = <TSignDataError = unknown>(
  args: SignTransactionArgs<TSignDataError>,
) => Promise<Result<SignedTransaction, SignTransactionError<TSignDataError>>>;

export type SignTransaction = <TSignDataError = unknown>(
  args: SignTransactionArgs<TSignDataError>,
) => Promise<SignedTransaction>;
