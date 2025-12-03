import type { PublicKey } from '../../_common/crypto';
import type { KeyPair } from 'nat-types/_common/keyPair/keyPair';
import type {
  InvalidArgsContext,
  UnknownErrorContext,
} from 'nat-types/natError';
import type {
  SafeSignTransaction,
  SignTransaction,
} from 'nat-types/keyServices/memoryKeyService/createSignTransaction';
import type {
  FindKeyPair,
  SafeFindKeyPair,
} from 'nat-types/keyServices/memoryKeyService/createFindKeyPair';

export type MemoryKeyServiceErrorVariant =
  | {
      kind: 'CreateMemoryKeyService.InvalidArgs';
      context: InvalidArgsContext;
    }
  | {
      kind: 'CreateMemoryKeyService.Unknown';
      context: UnknownErrorContext;
    }
  | {
      kind: 'MemoryKeyService.SignTransaction.InvalidArgs';
      context: InvalidArgsContext;
    }
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

export type KeyPairs = Record<PublicKey, KeyPair>;

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
