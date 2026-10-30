import type { Client, MemoryVault, Signer, SignerClient, VaultSignService } from '../../../index';
import { createSigner } from '../../../index';

type Equal<A, B> =
  (<T>() => T extends A ? 1 : 2) extends <T>() => T extends B ? 1 : 2 ? true : false;
type Expect<T extends true> = T;

declare const client: Client;
declare const signService: VaultSignService<MemoryVault>;

// A signer keeps the types of the sign service and the client it is created with...
const signer = createSigner({ signerAccountId: 'nat', client, signService });
type _Signer = Expect<Equal<typeof signer, Signer<VaultSignService<MemoryVault>, Client>>>;

// ...so the vault behind a vault sign service is reachable through it,
type _Vault = Expect<Equal<typeof signer.signService.vault, MemoryVault>>;

// ...and so is every method of a whole client
type _Client = Expect<Equal<typeof signer.client, Client>>;

// An object with just the client methods a signer needs is enough
declare const signerClient: SignerClient;
const narrowSigner = createSigner({ signerAccountId: 'nat', client: signerClient, signService });
type _SignerClient = Expect<Equal<typeof narrowSigner.client, SignerClient>>;

createSigner({
  signerAccountId: 'nat',
  // @ts-expect-error a signer can't send a transaction through such a client
  client: { safeGetAccessKeys: client.safeGetAccessKeys },
  signService,
});

// A signer of any sign service and client is still a Signer
const _anySigner: Signer = signer;
