import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '../../schemas/borsh';
import { toNativePublicKey } from '@common/transformers/borsh/toNativePublicKey';
import type { BorshBytes } from 'nat-types/common';
import type { Transaction, NativeTransaction } from 'nat-types/transaction';
import { toNativeActions } from '@common/transformers/borsh/toNativeActions';

export const toNativeTransaction = (
  transaction: Transaction,
): NativeTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toNativePublicKey(transaction.signerPublicKey),
  actions: toNativeActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: transaction.nonce,
  blockHash: base58.decode(transaction.blockHash),
});

export const nativeTransactionToBorsh = (
  nativeTransaction: NativeTransaction,
): BorshBytes => serialize(transactionBorshSchema, nativeTransaction);

export const transactionToBorsh = (transaction: Transaction): BorshBytes =>
  nativeTransactionToBorsh(toNativeTransaction(transaction));
