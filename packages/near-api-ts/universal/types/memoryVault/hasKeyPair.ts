import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { HasKeyPairArgs } from '../_common/vault';

type HasKeyPairError =
  | NatError<'MemoryVault.HasKeyPair.Args.InvalidSchema'>
  | NatError<'MemoryVault.HasKeyPair.Internal'>;

export type SafeHasKeyPair = (args: HasKeyPairArgs) => Promise<Result<boolean, HasKeyPairError>>;
export type HasKeyPair = (args: HasKeyPairArgs) => Promise<boolean>;
