import type { NatError } from '../../../src/_common/natError';
import type { Result } from '../../_common/common';
import type { PublicKey } from '../../_common/crypto';

type HasKeyArgs = { publicKey: PublicKey };

type HasKeyError =
  | NatError<'MemoryKeyService.HasKey.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.HasKey.Internal'>;

export type SafeHasKey = (args: HasKeyArgs) => Promise<Result<boolean, HasKeyError>>;
export type HasKey = (args: HasKeyArgs) => Promise<boolean>;
