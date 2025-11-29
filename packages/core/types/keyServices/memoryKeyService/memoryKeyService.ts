import type { PrivateKey, PublicKey } from '../../_common/crypto';
import type { Transaction } from '../../transaction';
import type { SignedTransaction } from '../../signedTransaction';
import type { Result } from 'nat-types/_common/common';
import type { KeyPair } from 'nat-types/_common/keyPair/keyPair';
import type { UnknownErrorContext } from 'nat-types/natError';
import type { NatError } from '@common/natError';

export type CreateMemoryKeyServiceErrorVariant = {
  kind: 'CreateMemoryKeyService.Unknown';
  context: UnknownErrorContext;
};

export type MemoryKeyServiceErrorVariant =
  | {
      kind: 'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound';
      context: {
        signerPublicKey: PublicKey;
      };
    }
  | {
      kind: 'MemoryKeyService.SignTransaction.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'MemoryKeyService.FindKeyPair.NotFound';
      context: {
        publicKey: PublicKey;
      };
    }
  | {
      kind: 'MemoryKeyService.FindKeyPair.Unknown';
      context: UnknownErrorContext;
    };

type FindKeyPairArgs = { publicKey: PublicKey };

type FindKeyPairError =
  | NatError<'MemoryKeyService.FindKeyPair.NotFound'>
  | NatError<'MemoryKeyService.FindKeyPair.Unknown'>;

// Safe version
export type SafeFindKeyPair = (
  args: FindKeyPairArgs,
) => Result<KeyPair, FindKeyPairError>;

// Throwable version
export type FindKeyPair = (args: FindKeyPairArgs) => KeyPair;

export type KeyPairs = Record<PublicKey, KeyPair>;

type SignTransactionArgs = {
  transaction: Transaction;
};

type SignTransactionError =
  | NatError<'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound'>
  | NatError<'MemoryKeyService.SignTransaction.Unknown'>;

// Safe version
export type SafeSignTransaction = (
  args: SignTransactionArgs,
) => Promise<Result<SignedTransaction, SignTransactionError>>;

// Throwable version
export type SignTransaction = (
  args: SignTransactionArgs,
) => Promise<SignedTransaction>;

export type MemoryKeyServiceContext = {
  keyPairs: KeyPairs;
  safeFindKeyPair: SafeFindKeyPair;
};

export type MemoryKeyService = {
  signTransaction: SignTransaction;
  findKeyPair: FindKeyPair;
  safe: {
    signTransaction: SafeSignTransaction;
    findKeyPair: SafeFindKeyPair;
  };
};

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceArgs = SingleKeySource | MultiKeySources;

type CreateMemoryKeyServiceError = NatError<'CreateMemoryKeyService.Unknown'>;

// Safe version
export type SafeCreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<Result<MemoryKeyService, CreateMemoryKeyServiceError>>;

// Throwable version
export type CreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<MemoryKeyService>;
