import { describe, expect, it } from 'vitest';
import {
  createMemoryVault,
  createVaultSignService,
  randomEd25519KeyPair,
  safeCreateVaultSignService,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('createVaultSignService', () => {
  it('creates a sign service over a memory vault', () => {
    const signService = createVaultSignService({ vault: createMemoryVault() });

    expect(signService.safeSignTransaction).toBeTypeOf('function');
    expect(signService.safeSignDelegation).toBeTypeOf('function');
  });

  it('gives back the vault it signs by', async () => {
    const keyPair = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKey: keyPair.privateKey });
    const signService = createVaultSignService({ vault });

    expect(signService.vault).toBe(vault);

    const dataU8 = new Uint8Array(32).fill(1);
    const signedData = await signService.vault.signData({ publicKey: keyPair.publicKey, dataU8 });
    expect(signedData.signature).toBe((await keyPair.signData({ dataU8 })).signature);
  });

  it('rejects a key pair as a vault with Args.InvalidSchema', () => {
    // A key pair signs data, but can't say which keys it holds
    const signService = safeCreateVaultSignService({
      // @ts-expect-error a key pair is not a vault
      vault: randomEd25519KeyPair(),
    });
    assertNatErrKind(signService, 'CreateVaultSignService.Args.InvalidSchema');
  });
});
