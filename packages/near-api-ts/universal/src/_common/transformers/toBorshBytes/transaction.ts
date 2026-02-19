import type { BorshBytes } from '@universal/types/_common/common';
import { serialize } from 'borsh';
import { signedTransactionBorshSchema, transactionBorshSchema } from '../../schemas/borsh';
import type { InnerSignedTransaction, InnerTransaction } from '../../schemas/zod/transaction/transaction';
import { toNativeSignedTransaction, toNativeTransaction } from '../toNative/transaction';

export const toBorshTransaction = (
  transaction: InnerTransaction,
): BorshBytes => {
  const nativeTransaction = toNativeTransaction(transaction);
  return serialize(transactionBorshSchema, nativeTransaction);
};

export const toBorshSignedTransaction = (
  signedTransaction: InnerSignedTransaction,
): BorshBytes => {
  const nativeSignedTransaction = toNativeSignedTransaction(signedTransaction);
  return serialize(signedTransactionBorshSchema, nativeSignedTransaction);
};
