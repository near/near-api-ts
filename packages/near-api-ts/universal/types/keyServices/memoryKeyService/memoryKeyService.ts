import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { PrivateKey, PublicKey } from '../../_common/crypto';
import type { KeyPair } from '../../_common/keyPairs/keyPair';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../../_common/natError';
import type { HasKey, SafeHasKey } from './hasKey';
import type { SafeSignData, SignData } from './signData';

export interface MemoryKeyServicePublicErrorRegistry {
  'CreateMemoryKeyService.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemoryKeyService.Internal': InternalErrorContext;
  'MemoryKeyService.SignData.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyService.SignData.SigningKey.NotFound': { publicKey: PublicKey };
  'MemoryKeyService.SignData.Internal': InternalErrorContext;
  'MemoryKeyService.HasKey.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyService.HasKey.Internal': InternalErrorContext;
}

// ************************************************************************************
// MemoryKeyService
export type KeyPairs = Record<PublicKey, KeyPair>;

export type MemoryKeyServiceContext = {
  keyPairs: KeyPairs;
  hasKey: HasKey;
};

export type MemoryKeyService = {
  hasKey: HasKey;
  signData: SignData;
  safeHasKey: SafeHasKey;
  safeSignData: SafeSignData;
};

// ************************************************************************************
// CreateMemoryKeyService

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceArgs = SingleKeySource | MultiKeySources;

type CreateMemoryKeyServiceError =
  | NatError<'CreateMemoryKeyService.Args.InvalidSchema'>
  | NatError<'CreateMemoryKeyService.Internal'>;

export type SafeCreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Result<MemoryKeyService, CreateMemoryKeyServiceError>;

export type CreateMemoryKeyService = (args: CreateMemoryKeyServiceArgs) => MemoryKeyService;
