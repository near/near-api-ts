import type { PrivateKey, PublicKey, Signature } from 'nat-types/crypto';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
};

export type Context = {
  keyPairs: Record<PublicKey, KeyPair>;
};

export type Transaction = {
  signerAccountId: string;
  signerPublicKey: PublicKey;
  action?: any;
  actions?: any[]; // TODO Fix
  receiverAccountId: string;
  nonce: bigint | number;
  blockHash: string;
};

export type SignedTransaction = {
  transaction: Transaction;
  transactionHash: string;
  signature: Signature;
};

export type SignTransaction = (transaction: Transaction) => Promise<SignedTransaction>;

export type MemoryKeyService = {
  signTransaction: SignTransaction;
};
