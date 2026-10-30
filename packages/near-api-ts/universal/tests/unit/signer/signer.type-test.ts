import type { Client, MemoryVault, Signer, VaultSignService } from '../../../index';
import { createSigner } from '../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

declare const client: Client;
declare const signService: VaultSignService<MemoryVault>;

// A signer keeps the type of the sign service it is created with...
const signer = createSigner({ signerAccountId: 'nat', client, signService });
type _Signer = Expect<Equal<typeof signer, Signer<VaultSignService<MemoryVault>>>>;

// ...so the vault behind a vault sign service is reachable through it
type _Vault = Expect<Equal<typeof signer.signService.vault, MemoryVault>>;

// A signer of any sign service is still a Signer
const _anySigner: Signer = signer;
