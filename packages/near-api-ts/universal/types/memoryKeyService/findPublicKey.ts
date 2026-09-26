import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey, PublicKeyRef } from '../_common/crypto';

type FindPublicKeyArgs = { publicKeyRef: PublicKeyRef };

type FindPublicKeyError =
  | NatError<'MemoryKeyService.FindPublicKey.Args.InvalidSchema'>
  | NatError<'MemoryKeyService.FindPublicKey.Internal'>;

export type SafeFindPublicKey = (
  args: FindPublicKeyArgs,
) => Promise<Result<PublicKey | undefined, FindPublicKeyError>>;

export type FindPublicKey = (args: FindPublicKeyArgs) => Promise<PublicKey | undefined>;
