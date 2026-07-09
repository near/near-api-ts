import { serialize } from 'borsh';
import type { BorshBytes } from '../../../../types/_common/common';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from '../../schemas/borsh/transaction';
import type { InnerSignature } from '../../schemas/zod/common/signature';
import type { InnerTransaction } from '../../schemas/zod/transaction/transaction';
import { toNativeSignedTransaction, toNativeTransaction } from '../toNative/transaction';

export const getTransactionBorsh = (transaction: InnerTransaction): BorshBytes => {
  const nativeTransaction = toNativeTransaction(transaction);
  return serialize(TransactionBorshSchema, nativeTransaction);
};

export const getSignedTransactionBorsh = (
  transaction: InnerTransaction,
  signature: InnerSignature,
): BorshBytes => {
  const nativeSignedTransaction = toNativeSignedTransaction(transaction, signature);
  return serialize(SignedTransactionBorshSchema, nativeSignedTransaction);
};
