import { serialize } from 'borsh';
import { signedTransactionBorshSchema } from '../schemas/borsh';
import { toBorshTransaction } from './borshTransaction';
import type { Signature } from 'nat-types';
import type { SignedTransaction } from 'nat-types/common/transaction';
import { fromCurveString } from './curveString';


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
