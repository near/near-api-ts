import type {
  NativeSignedTransaction,
  SignedTransaction,
} from 'nat-types/signedTransaction';
import type { BorshBytes } from 'nat-types/common';
import { serialize } from 'borsh';
import { signedTransactionBorshSchema } from '@common/schemas/borsh';
import { toNativeSignedTransaction } from '@common/transformers/toNative/signedTransaction';

export const serializeNativeSignedTransaction = (
  nativeSignedTransaction: NativeSignedTransaction,
): BorshBytes =>
  serialize(signedTransactionBorshSchema, nativeSignedTransaction);

export const serializeSignedTransaction = (
  signedTransaction: SignedTransaction,
): BorshBytes => {
  const nativeSignedTransaction = toNativeSignedTransaction(signedTransaction);
  return serializeNativeSignedTransaction(nativeSignedTransaction);
};
