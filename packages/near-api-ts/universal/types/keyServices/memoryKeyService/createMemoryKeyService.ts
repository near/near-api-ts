import type { NatError } from '../../../src/_common/natError';
import type { PrivateKey } from '../../_common/crypto';
import type { Result } from '../../_common/common';
import type { MemoryKeyService } from './memoryKeyService';

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

export type CreateMemoryKeyService = (
  args: CreateMemoryKeyServiceArgs,
) => MemoryKeyService;
