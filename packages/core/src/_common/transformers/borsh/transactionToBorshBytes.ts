import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '../../schemas/borsh';
import { toBorshPublicKey } from '@common/transformers/borsh/toBorshPublicKey';
import type { BorshBytes } from 'nat-types/common';
import type { Transaction, NativeTransaction } from 'nat-types/transaction';
import { toNativeActions } from '@common/transformers/borsh/toNativeActions/toNativeActions';

export const toNativeTransaction = (transaction: Transaction): NativeTransaction => ({
  signerId: transaction.signerAccountId,
  publicKey: toBorshPublicKey(transaction.signerPublicKey),
  actions: toNativeActions(transaction),
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: base58.decode(transaction.blockHash),
});

export const borshSerializeNativeTransaction = (
  nativeTransaction: NativeTransaction,
) => serialize(transactionBorshSchema, nativeTransaction);

export const transactionToBorshBytes = (transaction: Transaction): BorshBytes =>
  borshSerializeNativeTransaction(toNativeTransaction(transaction));
