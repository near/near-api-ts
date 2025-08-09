import type { PrivateKey, PublicKey } from '../crypto';
import type { Transaction } from '../transaction';
import type { SignedTransaction } from '../signedTransaction';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
};

export type Context = {
  keyPairs: Record<PublicKey, KeyPair>;
  findPrivateKey: (publicKey: PublicKey) => PrivateKey;
};

export type SignTransaction = (
  transaction: Transaction,
) => Promise<SignedTransaction>;

export type MemoryKeyService = {
  signTransaction: SignTransaction;
};
