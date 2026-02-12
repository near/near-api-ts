import type { NatError } from '@universal/src/_common/natError';
import type { PrivateKey } from '@universal/types/_common/crypto';
import type { Result } from '@universal/types/_common/common';
import type { FileKeyService } from './fileKeyService';

type KeySource = { privateKey: PrivateKey };
type SingleKeySource = { keySource: KeySource; keySources?: never };
type MultiKeySources = { keySource?: never; keySources: KeySource[] };

export type CreateFileKeyServiceArgs = SingleKeySource | MultiKeySources;

type CreateFileKeyServiceError =
  | NatError<'CreateFileKeyService.Args.InvalidSchema'>
  | NatError<'CreateFileKeyService.Internal'>;

export type SafeCreateFileKeyService = (
  args: CreateFileKeyServiceArgs,
) => Result<FileKeyService, CreateFileKeyServiceError>;

export type CreateFileKeyService = (
  args: CreateFileKeyServiceArgs,
) => FileKeyService;
