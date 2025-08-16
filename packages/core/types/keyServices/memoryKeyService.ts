import type { PrivateKey, PublicKey } from '../crypto';
import type { Transaction } from '../transaction';
import type { SignedTransaction } from '../signedTransaction';
import type { CreateSigner } from 'nat-types/keyServices/signer';

export type KeySource = { privateKey: PrivateKey } | { seedPhrase: string };

type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceInput = SingleKeySource | MultiKeySources;

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
  createSigner: CreateSigner;
  signTransaction: SignTransaction;
};
