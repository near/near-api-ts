import { serialize } from 'borsh';
import type { BorshBytes } from '../../../../types/_common/common';
import type { InnerSignature } from '../../../_common/zodSchemas/signature';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from '../borsh/transaction';
import { toNativeSignedTransaction, toNativeTransaction } from '../toNative/transaction';
import type { InnerTransaction } from '../zodSchemas/transaction';

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
