import type { NatError } from '@common/natError';
import type { PrivateKey } from 'nat-types/_common/crypto';
import type { Result } from 'nat-types/_common/common';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateMemoryKeyServiceArgs = SingleKeySource | MultiKeySources;

type CreateMemoryKeyServiceError =
  | NatError<'CreateMemoryKeyService.Args.InvalidSchema'>
  | NatError<'CreateMemoryKeyService.Internal'>;

export type SafeCreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<Result<MemoryKeyService, CreateMemoryKeyServiceError>>;

export type CreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => Promise<MemoryKeyService>;
