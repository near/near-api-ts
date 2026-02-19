import type { PublicKey } from '../../_common/crypto';
import type { KeyPair } from '../../_common/keyPair/keyPair';
import type {
  InvalidSchemaErrorContext,
  InternalErrorContext,
} from '../../natError';
import type {
  SafeSignTransaction,
  SignTransaction,
} from './createSignTransaction';
import type { FindKeyPair, SafeFindKeyPair } from './createFindKeyPair';
import { MemoryKeyServiceBrand } from '../../../src/keyServices/memoryKeyService/createMemoryKeyService';

export interface MemoryKeyServicePublicErrorRegistry {
  'CreateMemoryKeyService.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemoryKeyService.Internal': InternalErrorContext;
  'MemoryKeyService.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound': {
    signerPublicKey: PublicKey;
  };
  'MemoryKeyService.SignTransaction.Internal': InternalErrorContext;
  'MemoryKeyService.FindKeyPair.Args.InvalidSchema': InvalidSchemaErrorContext;
  'MemoryKeyService.FindKeyPair.NotFound': { publicKey: PublicKey };
  'MemoryKeyService.FindKeyPair.Internal': InternalErrorContext;
}
export type KeyPairs = Record<PublicKey, KeyPair>;

export type MemoryKeyServiceContext = {
  keyPairs: KeyPairs;
  safeFindKeyPair: SafeFindKeyPair;
};

export type MemoryKeyService = {
  [MemoryKeyServiceBrand]: true;
  signTransaction: SignTransaction;
  safeSignTransaction: SafeSignTransaction;
  findKeyPair: FindKeyPair;
  safeFindKeyPair: SafeFindKeyPair;
};
