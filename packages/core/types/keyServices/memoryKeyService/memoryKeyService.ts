import type { PublicKey } from '../../_common/crypto';
import type { KeyPair } from 'nat-types/_common/keyPair/keyPair';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from 'nat-types/natError';
import type {
  SafeSignTransaction,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService/createSignTransaction';
import type {
  FindKeyPair,
  SafeFindKeyPair,
} from 'nat-types/keyServices/memoryKeyService/createFindKeyPair';
import { MemoryKeyServiceBrand } from '../../../src/keyServices/memoryKeyService/createMemoryKeyService';

export type MemoryKeyServiceErrorVariant =
  | {
      kind: 'CreateMemoryKeyService.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateMemoryKeyService.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'MemoryKeyService.SignTransaction.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'MemoryKeyService.SignTransaction.SigningKeyPair.NotFound';
      context: {
        signerPublicKey: PublicKey;
      };
    }
  | {
      kind: 'MemoryKeyService.SignTransaction.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'MemoryKeyService.FindKeyPair.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'MemoryKeyService.FindKeyPair.NotFound';
      context: {
        publicKey: PublicKey;
      };
    }
  | {
      kind: 'MemoryKeyService.FindKeyPair.Internal';
      context: InternalErrorContext;
    };

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
