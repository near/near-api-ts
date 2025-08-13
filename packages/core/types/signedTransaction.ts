import type { Base58CryptoHash } from 'nat-types/common';
import type { Signature, NativeSignature } from 'nat-types/crypto';
import type { Transaction, NativeTransaction } from 'nat-types/transaction';

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: Base58CryptoHash;
  signature: Signature;
};

export type NativeSignedTransaction = {
  transaction: NativeTransaction
  signature: NativeSignature
}
