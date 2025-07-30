import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import { SCHEMA } from '../borshSchemas/najSchema';
import { fromCurveString } from '../crypto/curveString';
import type { PublicKey } from '@near-api-ts/types';

export type Transaction = {
  signerAccountId: string;
  signerPublicKey: PublicKey;
  action?: any;
  actions?: any[];
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
};

// TODO Add return type
const toBorshPublicKey = (publicKey: PublicKey) => {
  const { curve, u8Data } = fromCurveString(publicKey);
  return { [`${curve}Key`]: { data: u8Data } };
};

export const toBorshTransaction = (transaction: Transaction) => ({
  signerId: transaction.signerAccountId,
  publicKey: toBorshPublicKey(transaction.signerPublicKey),
  actions: [transaction.action],
  receiverId: transaction.receiverAccountId,
  nonce: BigInt(transaction.nonce),
  blockHash: base58.decode(transaction.blockHash),
});

export const serializeTransactionToBorsh = (transaction: Transaction) => {
  const borshTransaction = toBorshTransaction(transaction);
  return serialize(SCHEMA.Transaction, borshTransaction);
};
