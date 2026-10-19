import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PrivateKey, PublicKey } from '../_common/crypto';
import type { KeyPair } from '../_common/keyPairs/keyPair';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { FindPublicKey, SafeFindPublicKey } from './findPublicKey';
import type { HasKey, SafeHasKey } from './hasKey';
import type { SafeSignData, SignData } from './signData';

export interface MemoryKeyVaultPublicErrorRegistry {
  'CreateMemoryKeyVault.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemoryKeyVault.Internal': InternalErrorContext;
  'MemoryKeyVault.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyVault.SignData.SigningKey.NotFound': { publicKey: PublicKey };
  'MemoryKeyVault.SignData.Internal': InternalErrorContext;
  'MemoryKeyVault.HasKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyVault.HasKey.Internal': InternalErrorContext;
  'MemoryKeyVault.FindPublicKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyVault.FindPublicKey.Internal': InternalErrorContext;
}

// ************************************************************************************
// MemoryKeyVault
export type KeyPairs = Record<PublicKey, KeyPair>;

export type MemoryKeyVaultContext = {
  keyPairs: KeyPairs;
  hasKey: HasKey;
};

export type MemoryKeyVault = {
  hasKey: HasKey;
  findPublicKey: FindPublicKey;
  signData: SignData;
  safeHasKey: SafeHasKey;
  safeFindPublicKey: SafeFindPublicKey;
  safeSignData: SafeSignData;
};

// ************************************************************************************
// CreateMemoryKeyVault

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyVaultArgs = SingleKeySource | MultiKeySources;

type CreateMemoryKeyVaultError =
  | NatError<'CreateMemoryKeyVault.Args.InvalidSchema'>
  | NatError<'CreateMemoryKeyVault.Internal'>;

export type SafeCreateMemoryKeyVault = (
  args: CreateMemoryKeyVaultArgs,
) => Result<MemoryKeyVault, CreateMemoryKeyVaultError>;

export type CreateMemoryKeyVault = (args: CreateMemoryKeyVaultArgs) => MemoryKeyVault;
