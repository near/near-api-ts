import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { HasKeyPairArgs, HasKeyPairErrorOf, Vault } from '../_common/vault';

type HasKeyPairError<V extends Vault> =
  | NatError<'VaultSignService.HasKeyPair.Args.InvalidSchema'>
  | NatError<'VaultSignService.HasKeyPair.Vault.Failed', { cause: HasKeyPairErrorOf<V> }>
  | NatError<'VaultSignService.HasKeyPair.Internal'>;

export type SafeHasKeyPair<V extends Vault> = (
  args: HasKeyPairArgs,
) => Promise<Result<boolean, HasKeyPairError<V>>>;

export type HasKeyPair = (args: HasKeyPairArgs) => Promise<boolean>;
