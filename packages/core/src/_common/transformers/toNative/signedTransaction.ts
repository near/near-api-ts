import { toNativeSignature } from '@common/transformers/toNative/signature';
import { toNativeTransaction } from '@common/transformers/toNative/transaction';
import type {
  NativeSignedTransaction,
  SignedTransaction,
} from 'nat-types/signedTransaction';

export const toNativeSignedTransaction = (
  signedTransaction: SignedTransaction,
): NativeSignedTransaction => ({
  transaction: toNativeTransaction(signedTransaction.transaction),
  signature: toNativeSignature(signedTransaction.signature),
});
