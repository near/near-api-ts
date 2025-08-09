import type { Base58CryptoHash } from 'nat-types/common';
import type { Signature } from 'nat-types/crypto';
import type { Transaction } from 'nat-types/transaction';

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: Base58CryptoHash;
  signature: Signature;
};
