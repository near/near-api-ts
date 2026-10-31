import type { MemoryVault, SignService, VaultSignService } from '../../../index';

type Expect<T extends true> = T;
type Extends<A, B> = [A] extends [B] ? true : false;

// A signer takes a vault sign service as a sign service
type _VaultSignServiceIsSignService = Expect<Extends<VaultSignService<MemoryVault>, SignService>>;

// A vault signs data, but not transactions, so it isn't one
type _VaultIsNotSignService = Expect<Extends<Extends<MemoryVault, SignService>, false>>;

// Nor is a service that signs transactions, but not delegations
type _NoSignDelegationIsNotSignService = Expect<
  Extends<Extends<Omit<VaultSignService<MemoryVault>, 'safeSignDelegation'>, SignService>, false>
>;
