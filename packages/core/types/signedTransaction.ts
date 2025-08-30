import type { CryptoHash } from 'nat-types/common';
import type { Signature, NativeSignature } from 'nat-types/crypto';
import type { Transaction, NativeTransaction } from 'nat-types/transaction';

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: CryptoHash;
  signature: Signature;
};

export type NativeSignedTransaction = {
  transaction: NativeTransaction
  signature: NativeSignature
}
