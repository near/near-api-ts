import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type { GetPublicKeyArgs } from '../_common/vault';

type GetPublicKeyError =
  | NatError<'MemoryVault.GetPublicKey.Args.InvalidSchema'>
  | NatError<'MemoryVault.GetPublicKey.PublicKey.NotFound'>
  | NatError<'MemoryVault.GetPublicKey.Internal'>;

export type SafeGetPublicKey = (
  args: GetPublicKeyArgs,
) => Promise<Result<PublicKey, GetPublicKeyError>>;

export type GetPublicKey = (args: GetPublicKeyArgs) => Promise<PublicKey>;
