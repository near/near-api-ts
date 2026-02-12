import type { PublicKey } from '@universal/types/_common/crypto';
import type { KeyPair } from '@universal/types/_common/keyPair/keyPair';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from '@universal/types/natError';
import type {
  SafeSignTransaction,
  SignTransaction,
} from './signTransaction';
import type {
  FindKeyPair,
  SafeFindKeyPair,
} from './createFindKeyPair';

export type FileKeyServiceErrorVariant =
  | {
      kind: 'CreateFileKeyService.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateFileKeyService.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'FileKeyService.SignTransaction.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'FileKeyService.SignTransaction.SigningKeyPair.NotFound';
      context: {
        signerPublicKey: PublicKey;
      };
    }
  | {
      kind: 'FileKeyService.SignTransaction.Internal';
      context: InternalErrorContext;
    }
  | {
      kind: 'FileKeyService.FindKeyPair.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'FileKeyService.FindKeyPair.NotFound';
      context: {
        publicKey: PublicKey;
      };
    }
  | {
      kind: 'FileKeyService.FindKeyPair.Internal';
      context: InternalErrorContext;
    };

export type FileKeyServiceInternalErrorKind =
  | 'CreateFileKeyService.Internal'
  | 'FileKeyService.SignTransaction.Internal'
  | 'FileKeyService.FindKeyPair.Internal';

export type KeyPairs = Record<PublicKey, KeyPair>;

export type FileKeyServiceContext = {
  keyPairs: KeyPairs;
};

export type FileKeyService = {
  signTransaction: SignTransaction;
  safeSignTransaction: SafeSignTransaction;
  findKeyPair: FindKeyPair;
  safeFindKeyPair: SafeFindKeyPair;
};
