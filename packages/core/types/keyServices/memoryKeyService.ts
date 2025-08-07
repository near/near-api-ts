import type { PrivateKey, PublicKey } from '../crypto';
import type {
  Transaction,
  SignedTransaction,
} from '../transaction';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
};

export type Context = {
  findPrivateKey: (publicKey: PublicKey) => PrivateKey;
  keyPairs: Record<PublicKey, KeyPair>;
};

export type SignTransaction = (
  transaction: Transaction,
) => Promise<SignedTransaction>;

export type MemoryKeyService = {
  signTransaction: SignTransaction;
};
