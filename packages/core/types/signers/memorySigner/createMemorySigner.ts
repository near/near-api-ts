import type { MemorySigner } from 'nat-types/signers/memorySigner/memorySigner';
import type { AccountId, Milliseconds, Result } from 'nat-types/_common/common';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { NatError } from '@common/natError';
import type {
  InvalidSchemaContext,
  InternalErrorContext,
} from 'nat-types/natError';

export type CreateMemorySignerErrorVariant =
  | {
      kind: 'CreateMemorySigner.Args.InvalidSchema';
      context: InvalidSchemaContext;
    }
  | {
      kind: 'CreateMemorySigner.Signer.AccessKeys.NotFound';
      context: {
        signerAccountId: AccountId;
      };
    }
  | {
      kind: 'CreateMemorySigner.KeyPool.Empty';
      context: null;
    }
  | {
      kind: 'CreateMemorySigner.Internal';
      context: InternalErrorContext;
    };

export type CreateMemorySignerInternalErrorKind = 'CreateMemorySigner.Internal';

export type CreateMemorySignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  keyPool?: {
    signingKeys?: PublicKey[];
  };
  taskQueue?: {
    maxWaitInQueueMs?: Milliseconds;
  };
};

type CreateMemorySignerError =
  | NatError<'CreateMemorySigner.Args.InvalidSchema'>
  | NatError<'CreateMemorySigner.Signer.AccessKeys.NotFound'>
  | NatError<'CreateMemorySigner.KeyPool.Empty'>
  | NatError<'CreateMemorySigner.Internal'>;

export type SafeCreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Promise<Result<MemorySigner, CreateMemorySignerError>>;

export type CreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Promise<MemorySigner>;
