import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey, PublicKeyId } from '../_common/crypto';

type FindPublicKeyArgs = { publicKeyId: PublicKeyId };

type FindPublicKeyError =
  | NatError<'MemoryKeyVault.FindPublicKey.Args.InvalidSchema'>
  | NatError<'MemoryKeyVault.FindPublicKey.Internal'>;

export type SafeFindPublicKey = (
  args: FindPublicKeyArgs,
) => Promise<Result<PublicKey | undefined, FindPublicKeyError>>;

export type FindPublicKey = (args: FindPublicKeyArgs) => Promise<PublicKey | undefined>;
