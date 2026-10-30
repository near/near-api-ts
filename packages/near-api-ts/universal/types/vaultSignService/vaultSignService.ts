import type { NatError } from '../../src/_common/_common/_common/_common/natError';
import type { Result } from '../_common/common';
import type { PublicKey } from '../_common/crypto';
import type { InternalErrorContext, InvalidSchemaErrorContext } from '../_common/natError';
import type { Vault } from '../_common/vault';
import type { SafeSignDelegation, SignDelegation } from './signDelegation';
import type { SafeSignTransaction, SignTransaction } from './signTransaction';

export interface VaultSignServicePublicErrorRegistry {
  'CreateVaultSignService.Args.InvalidSchema': InvalidSchemaErrorContext;
  'CreateVaultSignService.Internal': InternalErrorContext;
  'VaultSignService.SignTransaction.Args.InvalidSchema': InvalidSchemaErrorContext;
  'VaultSignService.SignTransaction.SigningKey.NotFound': { publicKey: PublicKey };
  'VaultSignService.SignTransaction.Vault.Failed': { cause: unknown };
  'VaultSignService.SignTransaction.Internal': InternalErrorContext;
  'VaultSignService.SignDelegation.Args.InvalidSchema': InvalidSchemaErrorContext;
  'VaultSignService.SignDelegation.SigningKey.NotFound': { publicKey: PublicKey };
  'VaultSignService.SignDelegation.Vault.Failed': { cause: unknown };
  'VaultSignService.SignDelegation.Internal': InternalErrorContext;
}

// ************************************************************************************
// VaultSignService

export type VaultSignServiceContext<V extends Vault> = {
  vault: V;
};

/**
 * Signs NEAR objects by the keys of a vault. A failed vault call comes back as the `cause`
 * of the error, typed as vault `V` reports it - `VaultSignService<MemoryVault>` carries
 * MemoryVault errors.
 */
export type VaultSignService<V extends Vault> = {
  vault: V;
  signTransaction: SignTransaction;
  signDelegation: SignDelegation;
  safeSignTransaction: SafeSignTransaction<V>;
  safeSignDelegation: SafeSignDelegation<V>;
};

// ************************************************************************************
// CreateVaultSignService

export type CreateVaultSignServiceArgs<V extends Vault> = {
  vault: V;
};

type CreateVaultSignServiceError =
  | NatError<'CreateVaultSignService.Args.InvalidSchema'>
  | NatError<'CreateVaultSignService.Internal'>;

export type SafeCreateVaultSignService = <V extends Vault>(
  args: CreateVaultSignServiceArgs<V>,
) => Result<VaultSignService<V>, CreateVaultSignServiceError>;

export type CreateVaultSignService = <V extends Vault>(
  args: CreateVaultSignServiceArgs<V>,
) => VaultSignService<V>;
