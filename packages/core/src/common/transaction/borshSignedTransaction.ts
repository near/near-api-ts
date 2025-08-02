import { serialize } from 'borsh';
import { signedTransactionBorshSchema } from 'nat-schemas/borsh';
import { toBorshTransaction, type Transaction } from './borshTransaction';
import type { Signature } from 'nat-types';
import { fromCurveString } from '../crypto/curveString';

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: string;
  signature: Signature;
};

// TODO Add return type
const toBorshSignature = (signature: Signature) => {
  const { curve, u8Data } = fromCurveString(signature);
  return { [`${curve}Signature`]: { data: u8Data } };
};

const toBorshSignedTransaction = (signedTransaction: SignedTransaction) => ({
  transaction: toBorshTransaction(signedTransaction.transaction),
  signature: toBorshSignature(signedTransaction.signature),
});

export const serializeSignedTransactionToBorsh = (
  signedTransaction: SignedTransaction,
) => {
  const borshSignedTransaction = toBorshSignedTransaction(signedTransaction);
  return serialize(signedTransactionBorshSchema, borshSignedTransaction);
};
