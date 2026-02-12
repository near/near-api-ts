import type {
  SignedTransaction,
  Transaction,
} from '@universal/types/transaction';
import type { NatError } from '@universal/src/_common/natError';
import type { Result } from '@universal/types/_common/common';

type SignTransactionArgs = {
  transaction: Transaction;
};

type SignTransactionError =
  | NatError<'FileKeyService.SignTransaction.Args.InvalidSchema'>
  | NatError<'FileKeyService.SignTransaction.SigningKeyPair.NotFound'>
  | NatError<'FileKeyService.SignTransaction.Internal'>;

export type SafeSignTransaction = (
  args: SignTransactionArgs,
) => Promise<Result<SignedTransaction, SignTransactionError>>;

export type CreateSafeSignTransaction = (context: any) => SafeSignTransaction;

export type SignTransaction = (
  args: SignTransactionArgs,
) => Promise<SignedTransaction>;
