import { getTransactionHash } from '../../../../../../../src/signServices/signTransaction/getTransactionHash';
import { getSignedTransactionBorsh } from '../../../../../../../src/signServices/signTransaction/toBorshBytes/transaction';
import {
  type InnerTransaction,
  TransactionZodSchema,
} from '../../../../../../../src/signServices/signTransaction/zodSchemas/transaction';
import type { KeyPair } from '../../../../../../../types/_common/keyPairs/keyPair';

/**
 * Some `ActionsValidationError` variants guard a field our own schemas guard too — an account id
 * the node wouldn't parse, for one. `signTransaction` runs `TransactionZodSchema` over the whole
 * transaction before signing it, so a case for one of those variants can't go through it.
 *
 * This is the same routine with the schema check left out: the transaction is parsed while it is
 * still valid, `tamper` rewrites the field afterwards, and the tampered body is what gets signed.
 * Signing it (rather than patching the serialized bytes) keeps the signature valid, so the node
 * has no reason to stop before it validates the actions.
 */
export const signInvalidTransaction = async (
  signDataProvider: KeyPair,
  transaction: unknown,
  tamper: (transaction: InnerTransaction) => InnerTransaction,
) => {
  const tamperedTransaction = tamper(TransactionZodSchema.parse(transaction));

  const { transactionHash, transactionHashU8 } = getTransactionHash(tamperedTransaction);
  const signedData = await signDataProvider.signData({ dataU8: transactionHashU8 });

  return {
    transactionHash,
    signedTransactionBorsh64: getSignedTransactionBorsh(tamperedTransaction, signedData).toBase64(),
  };
};
