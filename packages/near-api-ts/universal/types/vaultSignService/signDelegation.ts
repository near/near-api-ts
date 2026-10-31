import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { SignDelegationArgs } from '../_common/signService';
import type { SignDelegationOutput } from '../_common/transaction/signDelegation';
import type { HasKeyPairErrorOf, SignDataErrorOf, Vault } from '../_common/vault';

type SignDelegationError<V extends Vault> =
  | NatError<'VaultSignService.SignDelegation.Args.InvalidSchema'>
  | NatError<'VaultSignService.SignDelegation.KeyPair.NotFound'>
  | NatError<
      'VaultSignService.SignDelegation.Vault.Failed',
      { cause: HasKeyPairErrorOf<V> | SignDataErrorOf<V> }
    >
  | NatError<'VaultSignService.SignDelegation.Internal'>;

export type SafeSignDelegation<V extends Vault> = (
  args: SignDelegationArgs,
) => Promise<Result<SignDelegationOutput, SignDelegationError<V>>>;

export type SignDelegation = (args: SignDelegationArgs) => Promise<SignDelegationOutput>;
