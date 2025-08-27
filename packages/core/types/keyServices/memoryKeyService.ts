import type { PrivateKey, PublicKey } from '../crypto';
import type { Transaction } from '../transaction';
import type { SignedTransaction } from '../signedTransaction';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceInput = SingleKeySource | MultiKeySources;

export type KeyPairs = Record<PublicKey, PrivateKey>;

export type Context = {
  keyPairs: KeyPairs;
  findPrivateKey: (publicKey: PublicKey) => PrivateKey;
};

export type SignTransaction = (
  transaction: Transaction,
) => Promise<SignedTransaction>;

export type MemoryKeyService = {
  signTransaction: SignTransaction;
  getKeyPairs: () => KeyPairs;
};
