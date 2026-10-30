import type { MemoryVault, Vault, VaultSignService } from '../../../../index';
import { createVaultSignService } from '../../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

type ErrorOf<F extends (...args: never[]) => Promise<unknown>> = Extract<
  Awaited<ReturnType<F>>,
  { success: false }
>['error'];

type CauseOf<E, K> = Extract<E, { kind: K }> extends { context: { cause: infer C } } ? C : never;

type SignTransactionError = ErrorOf<VaultSignService<MemoryVault>['safeSignTransaction']>;
type SignDelegationError = ErrorOf<VaultSignService<MemoryVault>['safeSignDelegation']>;

type HasKeyPairErrorKind =
  | 'MemoryVault.HasKeyPair.Args.InvalidSchema'
  | 'MemoryVault.HasKeyPair.Internal';

type SignDataErrorKind =
  | 'MemoryVault.SignData.Args.InvalidSchema'
  | 'MemoryVault.SignData.SigningKey.NotFound'
  | 'MemoryVault.SignData.Internal';

// A failed vault call comes back with the error the vault reports, whichever call it was
type _SignTransactionVault = Expect<
  Equal<
    CauseOf<SignTransactionError, 'VaultSignService.SignTransaction.Vault.Failed'>['kind'],
    HasKeyPairErrorKind | SignDataErrorKind
  >
>;
type _SignDelegationVault = Expect<
  Equal<
    CauseOf<SignDelegationError, 'VaultSignService.SignDelegation.Vault.Failed'>['kind'],
    HasKeyPairErrorKind | SignDataErrorKind
  >
>;

// Over the contract alone, nothing is known about the errors of the vault
type _ContractCause = Expect<
  Equal<
    CauseOf<
      ErrorOf<VaultSignService<Vault>['safeSignTransaction']>,
      'VaultSignService.SignTransaction.Vault.Failed'
    >,
    unknown
  >
>;

// A sign service takes the type of the vault it is created over
declare const memoryVault: MemoryVault;
const signService = createVaultSignService({ vault: memoryVault });
type _SignService = Expect<Equal<typeof signService, VaultSignService<MemoryVault>>>;

// ...and gives that vault back with its own methods, not just the ones a sign service needs
type _Vault = Expect<Equal<typeof signService.vault, MemoryVault>>;
