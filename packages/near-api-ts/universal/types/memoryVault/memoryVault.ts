import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PrivateKey, PublicKey, PublicKeyId } from '../_common/crypto';
import type { KeyPair } from '../_common/keyPairs/keyPair';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { AddKeyPair, SafeAddKeyPair } from './addKeyPair';
import type { DeleteKeyPair, SafeDeleteKeyPair } from './deleteKeyPair';
import type { GetPublicKey, SafeGetPublicKey } from './getPublicKey';
import type { HasKeyPair, SafeHasKeyPair } from './hasKeyPair';
import type { SafeSignData, SignData } from './signData';

export interface MemoryVaultPublicErrorRegistry {
  'CreateMemoryVault.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemoryVault.Internal': InternalErrorContext;
  'MemoryVault.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.SignData.SigningKey.NotFound': { publicKey: PublicKey };
  'MemoryVault.SignData.Internal': InternalErrorContext;
  'MemoryVault.HasKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.HasKeyPair.Internal': InternalErrorContext;
  'MemoryVault.GetPublicKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.GetPublicKey.PublicKey.NotFound': { publicKeyId: PublicKeyId };
  'MemoryVault.GetPublicKey.Internal': InternalErrorContext;
  'MemoryVault.AddKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.AddKeyPair.Internal': InternalErrorContext;
  'MemoryVault.DeleteKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryVault.DeleteKeyPair.Internal': InternalErrorContext;
}

// ************************************************************************************
// MemoryVault
export type KeyPairs = Record<PublicKey, KeyPair>;

export type MemoryVaultContext = {
  keyPairs: KeyPairs;
};

export type MemoryVault = {
  hasKeyPair: HasKeyPair;
  getPublicKey: GetPublicKey;
  signData: SignData;
  addKeyPair: AddKeyPair;
  deleteKeyPair: DeleteKeyPair;
  safeHasKeyPair: SafeHasKeyPair;
  safeGetPublicKey: SafeGetPublicKey;
  safeSignData: SafeSignData;
  safeAddKeyPair: SafeAddKeyPair;
  safeDeleteKeyPair: SafeDeleteKeyPair;
};

// ************************************************************************************
// CreateMemoryVault

/**
 * Without private keys - or with an empty `privateKeys` - the vault starts empty,
 * and `addKeyPair` fills it later.
 */
export type CreateMemoryVaultArgs =
  | { privateKey: PrivateKey; privateKeys?: never }
  | { privateKey?: never; privateKeys: PrivateKey[] };

type CreateMemoryVaultError =
  | NatError<'CreateMemoryVault.Args.InvalidSchema'>
  | NatError<'CreateMemoryVault.Internal'>;

export type SafeCreateMemoryVault = (
  args?: CreateMemoryVaultArgs,
) => Result<MemoryVault, CreateMemoryVaultError>;

export type CreateMemoryVault = (args?: CreateMemoryVaultArgs) => MemoryVault;
