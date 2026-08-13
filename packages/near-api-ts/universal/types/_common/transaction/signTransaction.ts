import type { NatError } from '../../../src/_common/_common/_common/natError';
import type { Result } from '../common';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../natError';
import type { SafeSignData } from '../signData';
import type { SignedTransaction, Transaction } from './transaction';

export interface SignTransactionPublicErrorRegistry {
  'SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'SignTransaction.SignData.Failed': { cause: unknown };
  'SignTransaction.Internal': InternalErrorContext;
}

export type SignTransactionArgs<SDE = unknown> = {
  signDataProvider: { safeSignData: SafeSignData<SDE> };
  transaction: Transaction;
};

type SignTransactionOutput = SignedTransaction;

type SignTransactionError<SDE> =
  | NatError<'SignTransaction.Args.InvalidSchema'>
  | NatError<'SignTransaction.SignData.Failed', { cause: SDE }>
  | NatError<'SignTransaction.Internal'>;

export type SafeSignTransaction = <SDE = unknown>(
  args: SignTransactionArgs<SDE>,
) => Promise<Result<SignTransactionOutput, SignTransactionError<SDE>>>;

export type SignTransaction = <SDE = unknown>(
  args: SignTransactionArgs<SDE>,
) => Promise<SignTransactionOutput>;
