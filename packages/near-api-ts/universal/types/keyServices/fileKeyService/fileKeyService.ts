import type { PublicKey } from '../../_common/crypto';
import type { KeyPair } from '../../_common/keyPair/keyPair';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from '../../natError';
import type {
  SafeSignTransaction,
  SignTransaction,
} from './createSignTransaction';
import type {
  FindKeyPair,
  SafeFindKeyPair,
} from './createFindKeyPair';
import { FileKeyServiceBrand } from '../../../src/keyServices/fileKeyService/createFileKeyService';

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
  safeFindKeyPair: SafeFindKeyPair;
};

export type FileKeyService = {
  [FileKeyServiceBrand]: true;
  signTransaction: SignTransaction;
  safeSignTransaction: SafeSignTransaction;
  findKeyPair: FindKeyPair;
  safeFindKeyPair: SafeFindKeyPair;
};
