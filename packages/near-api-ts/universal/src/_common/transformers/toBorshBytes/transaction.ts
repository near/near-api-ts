import { serialize } from 'borsh';
import type { BorshBytes } from '../../../../types/_common/common';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from '../../schemas/borsh/transaction';
import type {
  InnerSignedTransaction,
  InnerTransaction,
} from '../../schemas/zod/transaction/transaction';
import { toNativeSignedTransaction, toNativeTransaction } from '../toNative/transaction';

export const toBorshTransaction = (transaction: InnerTransaction): BorshBytes => {
  const nativeTransaction = toNativeTransaction(transaction);
  return serialize(TransactionBorshSchema, nativeTransaction);
};

export const toBorshSignedTransaction = (signedTransaction: InnerSignedTransaction): BorshBytes => {
  const nativeSignedTransaction = toNativeSignedTransaction(signedTransaction);
  return serialize(SignedTransactionBorshSchema, nativeSignedTransaction);
};
