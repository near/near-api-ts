import type {
  PublicKey,
  Signature,
  AccountId,
  BlockHash,
  AccessKeyNonce,
  Base58String,
} from 'nat-types';

export type Transaction = {
  signerAccountId: AccountId;
  signerPublicKey: PublicKey;
  action?: any;
  actions?: any[]; // TODO Fix
  receiverAccountId: AccountId;
  nonce: AccessKeyNonce;
  blockHash: BlockHash;
};

export type TransactionHash = Base58String;

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: TransactionHash;
  signature: Signature;
};
