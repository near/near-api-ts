import { serialize } from 'borsh';
import { signedTransactionBorshSchema } from '@common/schemas/borsh';
import { toNativeTransaction } from './transactionToBorsh';
import type { Signature } from 'nat-types/crypto';
import type { SignedTransaction } from 'nat-types/signedTransaction';
import { fromCurveString } from '../curveString';
import type { BorshBytes } from 'nat-types/common';

const getBorshSignature = (signature: Signature) => {
  // TODO we don't need validation here
  const { curve, u8Data } = fromCurveString(signature);
  return { [`${curve}Signature`]: { data: u8Data } };
};

const toSignedTransactionBorshObject = (
  signedTransaction: SignedTransaction,
) => ({
  transaction: toNativeTransaction(signedTransaction.transaction),
  signature: getBorshSignature(signedTransaction.signature),
});

export const toBorshSignedTransaction = (
  signedTransaction: SignedTransaction,
): BorshBytes => {
  const borshSignedTransaction =
    toSignedTransactionBorshObject(signedTransaction);
  return serialize(signedTransactionBorshSchema, borshSignedTransaction);
};
