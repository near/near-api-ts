import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type {
  GetPublicKeyArgs,
  GetPublicKeyErrorOf,
  HasKeyPairErrorOf,
  Vault,
} from '../_common/vault';

type GetPublicKeyError<V extends Vault> =
  | NatError<'VaultSignService.GetPublicKey.Args.InvalidSchema'>
  | NatError<'VaultSignService.GetPublicKey.PublicKey.NotFound'>
  | NatError<
      'VaultSignService.GetPublicKey.Vault.Failed',
      { cause: HasKeyPairErrorOf<V> | GetPublicKeyErrorOf<V> }
    >
  | NatError<'VaultSignService.GetPublicKey.Internal'>;

export type SafeGetPublicKey<V extends Vault> = (
  args: GetPublicKeyArgs,
) => Promise<Result<PublicKey, GetPublicKeyError<V>>>;

export type GetPublicKey = (args: GetPublicKeyArgs) => Promise<PublicKey>;
