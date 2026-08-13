import { sha256 } from '@noble/hashes/sha2.js';
import { base58 } from '@scure/base';
import { serialize } from 'borsh';
import {
  SignedTransactionBorshSchema,
  TransactionBorshSchema,
} from '../../../../../../../src/signServices/signTransaction/borsh/transaction';
import { toNativeSignature } from '../../../../../../../src/signServices/signTransaction/toNative/signature';
import { toNativeTransaction } from '../../../../../../../src/signServices/signTransaction/toNative/transaction';
import {
  type InnerTransaction,
  TransactionZodSchema,
} from '../../../../../../../src/signServices/signTransaction/zodSchemas/transaction';
import type { KeyPair } from '../../../../../../../types/_common/keyPairs/keyPair';
import type { NativeSignedTransaction } from '../../../../../../../types/_common/transaction/transaction';

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

  const nativeTransaction = toNativeTransaction(tamperedTransaction);
  const transactionBorshU8 = serialize(TransactionBorshSchema, nativeTransaction);
  const transactionHashU8 = sha256(transactionBorshU8);
  const transactionHash = base58.encode(transactionHashU8);

  const signedData = await signDataProvider.signData({ dataU8: transactionHashU8 });

  const nativeSignedTransaction: NativeSignedTransaction = {
    transaction: nativeTransaction,
    signature: toNativeSignature(signedData),
  };

  const signedTransactionBorsh64 = serialize(
    SignedTransactionBorshSchema,
    nativeSignedTransaction,
  ).toBase64();

  return {
    transactionHash,
    signedTransactionBorsh64,
  };
};
