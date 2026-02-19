import type { MemorySigner } from '../memorySigner';
import type { AccountId, Milliseconds, Result } from '../../../_common/common';
import type { Client } from '../../../client/client';
import type { MemoryKeyService } from '../../../keyServices/memoryKeyService/memoryKeyService';
import type { PublicKey } from '../../../_common/crypto';
import type { NatError } from '../../../../src/_common/natError';
import type {
  ArgsInvalidSchema,
  Internal,
  InternalErrorContext,
  InvalidSchemaErrorContext,
} from '../../../natError';

export interface CreateMemorySignerPublicErrorRegistry {
  'CreateMemorySigner.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateMemorySigner.Internal': InternalErrorContext;
}

export type CreateMemorySignerArgs = {
  signerAccountId: AccountId;
  client: Client;
  keyService: MemoryKeyService;
  keyPool?: {
    allowedAccessKeys?: PublicKey[];
  };
  taskQueue?: {
    timeoutMs?: Milliseconds;
  };
};

type CreateMemorySignerError =
  | NatError<'CreateMemorySigner.Args.InvalidSchema'>
  | NatError<'CreateMemorySigner.Internal'>;

export type SafeCreateMemorySigner = (
  args: CreateMemorySignerArgs,
) => Result<MemorySigner, CreateMemorySignerError>;

export type CreateMemorySigner = (args: CreateMemorySignerArgs) => MemorySigner;

// Factory
export type SafeMemorySignerFactory = (
  signerAccountId: AccountId,
) => Result<MemorySigner, CreateMemorySignerError>;

export type CreateSafeMemorySignerFactory = (
  args: Omit<CreateMemorySignerArgs, 'signerAccountId'>,
) => SafeMemorySignerFactory;

export type MemorySignerFactory = (signerAccountId: AccountId) => MemorySigner;

export type CreateMemorySignerFactory = (
  args: Omit<CreateMemorySignerArgs, 'signerAccountId'>,
) => MemorySignerFactory;
