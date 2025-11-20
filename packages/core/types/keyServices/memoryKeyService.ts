import type { PrivateKey, PublicKey } from '../crypto';
import type { Transaction } from '../transaction';
import type { SignedTransaction } from '../signedTransaction';
import type { Result } from 'nat-types/common';

export type KeySource = { privateKey: PrivateKey };

type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceArgs = SingleKeySource | MultiKeySources;

export type KeyPair = { publicKey: PublicKey; privateKey: PrivateKey };
export type KeyPairs = Record<PublicKey, PrivateKey>;

export type FindPrivateKey = (args: { publicKey: PublicKey }) => PrivateKey;

export type SafeFindPrivateKey = (args: {
  publicKey: PublicKey;
}) => Result<PrivateKey, Error | string>; // TODO Fix error type

export type Context = {
  keyPairs: KeyPairs;
  safeFindPrivateKey: SafeFindPrivateKey;
};

type SignTransactionArgs = {
  transaction: Transaction;
};

export type SignTransaction = (
  args: SignTransactionArgs,
) => Promise<SignedTransaction>;

export type SafeSignTransaction = (
  args: SignTransactionArgs,
) => Promise<Result<SignedTransaction, unknown>>; // TODO Fix error type

export type MemoryKeyService = {
  signTransaction: SignTransaction;
  findPrivateKey: FindPrivateKey;
  safe: {
    signTransaction: SafeSignTransaction;
    findPrivateKey: SafeFindPrivateKey;
  };
};

export type SafeCreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<Result<MemoryKeyService, unknown>>;

export type CreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<MemoryKeyService>;
