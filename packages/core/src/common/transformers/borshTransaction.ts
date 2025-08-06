import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { transactionBorshSchema } from '../schemas/borsh';
import { fromCurveString } from './curveString';
import type { PublicKey } from 'nat-types';
import type { Transaction } from 'nat-types/common/transaction';

const toBorshPublicKey = (publicKey: PublicKey) => {
  const { curve, u8Data } = fromCurveString(publicKey);
  return { [`${curve}Key`]: { data: u8Data } };
};

export const toBorshTransaction = (transaction: Transaction) => ({
  signerId: transaction.signerAccountId,
  publicKey: toBorshPublicKey(transaction.signerPublicKey),
  actions: [transaction.action], // TODO fix
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: base58.decode(transaction.blockHash),
});

export const serializeTransactionToBorsh = (transaction: Transaction) => {
  const borshTransaction = toBorshTransaction(transaction);
  return serialize(transactionBorshSchema, borshTransaction);
};
