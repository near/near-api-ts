import type { PrivateKey, PublicKey } from 'nat-types/common/crypto';
import type {
  Transaction,
  SignedTransaction,
} from 'nat-types/common/transaction';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

export type KeyPair = {
  publicKey: PublicKey;
  privateKey: PrivateKey;
};

export type Context = {
  keyPairs: Record<PublicKey, KeyPair>;
};

export type SignTransaction = (
  transaction: Transaction,
) => Promise<SignedTransaction>;

export type MemoryKeyService = {
  signTransaction: SignTransaction;
};
