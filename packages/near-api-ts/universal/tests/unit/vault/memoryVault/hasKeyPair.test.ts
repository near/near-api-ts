import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, randomMlDsa65KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.hasKeyPair', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const keyVault = createMemoryVault({
    privateKeys: [ed25519KeyPair.privateKey, mlDsa65KeyPair.privateKey],
  });

  it('returns true for a key the vault holds', async () => {
    expect(await keyVault.hasKeyPair({ publicKey: ed25519KeyPair.publicKey })).toBe(true);
    expect(await keyVault.hasKeyPair({ publicKey: mlDsa65KeyPair.publicKey })).toBe(true);
  });

  it('returns true for the id of a key the vault holds', async () => {
    expect(await keyVault.hasKeyPair({ publicKeyId: ed25519KeyPair.publicKeyId })).toBe(true);
    expect(await keyVault.hasKeyPair({ publicKeyId: mlDsa65KeyPair.publicKeyId })).toBe(true);
  });

  it('returns false for a key the vault does not hold', async () => {
    const kp = randomMlDsa65KeyPair();

    expect(await keyVault.hasKeyPair({ publicKey: kp.publicKey })).toBe(false);
    expect(await keyVault.hasKeyPair({ publicKeyId: kp.publicKeyId })).toBe(false);
  });

  it('rejects an invalid public key with Args.InvalidSchema', async () => {
    const result = await keyVault.safeHasKeyPair({
      // @ts-expect-error
      publicKey: 1,
    });
    assertNatErrKind(result, 'MemoryVault.HasKeyPair.Args.InvalidSchema');
  });

  it('rejects a full ml-dsa-65 public key given as an id with Args.InvalidSchema', async () => {
    const result = await keyVault.safeHasKeyPair({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'MemoryVault.HasKeyPair.Args.InvalidSchema');
  });
});
