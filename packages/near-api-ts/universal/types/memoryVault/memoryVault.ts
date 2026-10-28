import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PrivateKey, PublicKey } from '../_common/crypto';
import type { KeyPair } from '../_common/keyPairs/keyPair';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { FindPublicKey, SafeFindPublicKey } from './findPublicKey';
import type { HasKey, SafeHasKey } from './hasKey';
import type { SafeSignData, SignData } from './signData';

export interface MemoryVaultPublicErrorRegistry {
  'CreateMemoryVault.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemoryVault.Internal': InternalErrorContext;
  'MemoryVault.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.SignData.SigningKey.NotFound': { publicKey: PublicKey };
  'MemoryVault.SignData.Internal': InternalErrorContext;
  'MemoryVault.HasKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.HasKey.Internal': InternalErrorContext;
  'MemoryVault.FindPublicKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.FindPublicKey.Internal': InternalErrorContext;
}

// ************************************************************************************
// MemoryVault
export type KeyPairs = Record<PublicKey, KeyPair>;

export type MemoryVaultContext = {
  keyPairs: KeyPairs;
  hasKey: HasKey;
};

export type MemoryVault = {
  hasKey: HasKey;
  findPublicKey: FindPublicKey;
  signData: SignData;
  safeHasKey: SafeHasKey;
  safeFindPublicKey: SafeFindPublicKey;
  safeSignData: SafeSignData;
};

// ************************************************************************************
// CreateMemoryVault

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryVaultArgs = SingleKeySource | MultiKeySources;

type CreateMemoryVaultError =
  | NatError<'CreateMemoryVault.Args.InvalidSchema'>
  | NatError<'CreateMemoryVault.Internal'>;

export type SafeCreateMemoryVault = (
  args: CreateMemoryVaultArgs,
) => Result<MemoryVault, CreateMemoryVaultError>;

export type CreateMemoryVault = (args: CreateMemoryVaultArgs) => MemoryVault;
