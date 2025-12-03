import type { NativeTransaction } from 'nat-types/transaction';
import type { BorshBytes } from 'nat-types/_common/common';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '@common/schemas/borsh';
import { toNativeTransaction } from '@common/transformers/toNative/transaction';
import type { InnerTransaction } from '@common/schemas/zod/transaction/transaction';

const serializeNativeTransaction = (
  nativeTransaction: NativeTransaction,
): BorshBytes => serialize(transactionBorshSchema, nativeTransaction);

export const serializeTransaction = (
  transaction: InnerTransaction,
): BorshBytes => {
  const nativeTransaction = toNativeTransaction(transaction);
  return serializeNativeTransaction(nativeTransaction);
};
