import type { NativeTransaction, Transaction } from 'nat-types/transaction';
import type { BorshBytes } from 'nat-types/common';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '@common/schemas/borsh';
import { toNativeTransaction } from '@common/transformers/toNative/transaction';

export const serializeNativeTransaction = (
  nativeTransaction: NativeTransaction,
): BorshBytes => serialize(transactionBorshSchema, nativeTransaction);

export const serializeTransaction = (transaction: Transaction): BorshBytes =>
  serializeNativeTransaction(toNativeTransaction(transaction));
