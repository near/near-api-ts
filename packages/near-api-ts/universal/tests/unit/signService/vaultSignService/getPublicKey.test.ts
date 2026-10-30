import { describe, expect, it } from 'vitest';
import {
  createMemoryVault,
  createVaultSignService,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('vaultSignService.getPublicKey', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const signService = createVaultSignService({
    vault: createMemoryVault({
      privateKeys: [ed25519KeyPair.privateKey, mlDsa65KeyPair.privateKey],
    }),
  });

  it('gets an ed25519 key by its id', async () => {
    expect(await signService.getPublicKey({ publicKeyId: ed25519KeyPair.publicKeyId })).toBe(
      ed25519KeyPair.publicKey,
    );
  });

  it('gets the full ml-dsa-65 key by its hash', async () => {
    expect(await signService.getPublicKey({ publicKeyId: mlDsa65KeyPair.publicKeyId })).toBe(
      mlDsa65KeyPair.publicKey,
    );
  });

  it('fails with PublicKey.NotFound for a key the vault does not hold', async () => {
    const { publicKeyId } = randomMlDsa65KeyPair();

    const result = await signService.safeGetPublicKey({ publicKeyId });
    assertNatErrKind(result, 'VaultSignService.GetPublicKey.PublicKey.NotFound');
    expect(result.error.context).toEqual({ publicKeyId });
  });

  it('rejects a full ml-dsa-65 public key given as an id with Args.InvalidSchema', async () => {
    const result = await signService.safeGetPublicKey({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'VaultSignService.GetPublicKey.Args.InvalidSchema');
  });

  it('fails with Vault.Failed when the vault fails to say if it holds the key', async () => {
    const lockedSignService = createVaultSignService({
      vault: {
        ...createMemoryVault(),
        safeHasKeyPair: async () => ({ success: false as const, error: 'Locked' as const }),
      },
    });

    const result = await lockedSignService.safeGetPublicKey({
      publicKeyId: ed25519KeyPair.publicKeyId,
    });
    assertNatErrKind(result, 'VaultSignService.GetPublicKey.Vault.Failed');
    expect(result.error.context.cause).toBe('Locked');
  });

  it('fails with Vault.Failed when the vault fails to get the key', async () => {
    // A vault that says it holds the key, but no longer holds it when asked for it
    const emptySignService = createVaultSignService({
      vault: {
        ...createMemoryVault(),
        safeHasKeyPair: async () => ({ success: true as const, data: true }),
      },
    });

    const result = await emptySignService.safeGetPublicKey({
      publicKeyId: ed25519KeyPair.publicKeyId,
    });
    assertNatErrKind(result, 'VaultSignService.GetPublicKey.Vault.Failed');
    expect(result.error.context.cause.kind).toBe('MemoryVault.GetPublicKey.PublicKey.NotFound');
  });
});
