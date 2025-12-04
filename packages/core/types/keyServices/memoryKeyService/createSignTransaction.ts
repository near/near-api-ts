import type {SignedTransaction, Transaction} from 'nat-types/transaction';
import type { NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';

type SignTransactionArgs = {
  transaction: Transaction;
};

type SignTransactionError =
  | NatError<'MemoryKeyService.SignTransaction.InvalidArgs'>
  | NatError<'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound'>
  | NatError<'MemoryKeyService.SignTransaction.Unknown'>;

export type SafeSignTransaction = (
  args: SignTransactionArgs,
) => Promise<Result<SignedTransaction, SignTransactionError>>;

export type SignTransaction = (
  args: SignTransactionArgs,
) => Promise<SignedTransaction>;
