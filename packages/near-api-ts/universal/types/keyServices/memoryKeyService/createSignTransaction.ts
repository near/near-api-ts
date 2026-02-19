import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { SignedTransaction, Transaction } from '../../_common/transaction/transaction';

type SignTransactionArgs = {
  transaction: Transaction;
};

type SignTransactionError =
  | NatError<'MemoryKeyService.SignTransaction.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound'>
  | NatError<'MemoryKeyService.SignTransaction.Internal'>;

export type SafeSignTransaction = (
  args: SignTransactionArgs,
) => Promise<Result<SignedTransaction, SignTransactionError>>;

export type SignTransaction = (
  args: SignTransactionArgs,
) => Promise<SignedTransaction>;
