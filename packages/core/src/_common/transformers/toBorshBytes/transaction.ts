import type { BorshBytes } from 'nat-types/_common/common';
import { serialize } from 'borsh';
import {
  signedTransactionBorshSchema,
  transactionBorshSchema,
} from '@common/schemas/borsh';
import {
  toNativeSignedTransaction,
  toNativeTransaction,
} from '@common/transformers/toNative/transaction';
import type {
  InnerSignedTransaction,
  InnerTransaction,
} from '@common/schemas/zod/transaction/transaction';

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
