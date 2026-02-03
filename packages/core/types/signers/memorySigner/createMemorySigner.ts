import type { MemorySigner } from 'nat-types/signers/memorySigner/memorySigner';
import type { AccountId, Milliseconds, Result } from 'nat-types/_common/common';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type { PublicKey } from 'nat-types/_common/crypto';
import type { NatError } from '@common/natError';
import type { ArgsInvalidSchema, Internal } from 'nat-types/natError';

type Prefix = 'CreateMemorySigner';

export type CreateMemorySignerErrorVariant =
  | ArgsInvalidSchema<Prefix>
  | Internal<Prefix>;

export type CreateMemorySignerInternalErrorKind = 'CreateMemorySigner.Internal';

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
