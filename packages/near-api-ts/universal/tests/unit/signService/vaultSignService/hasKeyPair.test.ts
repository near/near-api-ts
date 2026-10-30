import { describe, expect, it } from 'vitest';
import {
  createMemoryVault,
  createVaultSignService,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('vaultSignService.hasKeyPair', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const signService = createVaultSignService({
    vault: createMemoryVault({
      privateKeys: [ed25519KeyPair.privateKey, mlDsa65KeyPair.privateKey],
    }),
  });

  it('returns true for a key the vault holds', async () => {
    expect(await signService.hasKeyPair({ publicKey: ed25519KeyPair.publicKey })).toBe(true);
    expect(await signService.hasKeyPair({ publicKey: mlDsa65KeyPair.publicKey })).toBe(true);
  });

  it('returns true for the id of a key the vault holds', async () => {
    expect(await signService.hasKeyPair({ publicKeyId: ed25519KeyPair.publicKeyId })).toBe(true);
    expect(await signService.hasKeyPair({ publicKeyId: mlDsa65KeyPair.publicKeyId })).toBe(true);
  });

  it('returns false for a key the vault does not hold', async () => {
    const keyPair = randomMlDsa65KeyPair();

    expect(await signService.hasKeyPair({ publicKey: keyPair.publicKey })).toBe(false);
    expect(await signService.hasKeyPair({ publicKeyId: keyPair.publicKeyId })).toBe(false);
  });

  it('rejects a full ml-dsa-65 public key given as an id with Args.InvalidSchema', async () => {
    const result = await signService.safeHasKeyPair({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'VaultSignService.HasKeyPair.Args.InvalidSchema');
  });

  it('fails with Vault.Failed when the vault fails to say if it holds the key', async () => {
    const lockedSignService = createVaultSignService({
      vault: {
        ...createMemoryVault(),
        safeHasKeyPair: async () => ({ success: false as const, error: 'Locked' as const }),
      },
    });

    const result = await lockedSignService.safeHasKeyPair({ publicKey: ed25519KeyPair.publicKey });
    assertNatErrKind(result, 'VaultSignService.HasKeyPair.Vault.Failed');
    expect(result.error.context.cause).toBe('Locked');
  });
});
