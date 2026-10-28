import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, randomMlDsa65KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.deleteKeyPair', () => {
  it('deletes a key pair, so the vault no longer signs with it', async () => {
    const kp = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKey: kp.privateKey });

    await vault.deleteKeyPair({ publicKey: kp.publicKey });
    expect(await vault.hasKeyPair({ publicKey: kp.publicKey })).toBe(false);

    const signedData = await vault.safeSignData({
      publicKey: kp.publicKey,
      dataU8: new Uint8Array(32),
    });
    assertNatErrKind(signedData, 'MemoryVault.SignData.SigningKey.NotFound');
  });

  it('deletes a key pair by the id of its key', async () => {
    const ed25519KeyPair = randomEd25519KeyPair();
    const mlDsa65KeyPair = randomMlDsa65KeyPair();
    const vault = createMemoryVault({
      privateKeys: [ed25519KeyPair.privateKey, mlDsa65KeyPair.privateKey],
    });

    await vault.deleteKeyPair({ publicKeyId: ed25519KeyPair.publicKeyId });
    await vault.deleteKeyPair({ publicKeyId: mlDsa65KeyPair.publicKeyId });

    expect(await vault.hasKeyPair({ publicKey: ed25519KeyPair.publicKey })).toBe(false);
    expect(await vault.hasKeyPair({ publicKey: mlDsa65KeyPair.publicKey })).toBe(false);
  });

  it('keeps the other key pairs', async () => {
    const kp1 = randomEd25519KeyPair();
    const kp2 = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKeys: [kp1.privateKey, kp2.privateKey] });

    await vault.deleteKeyPair({ publicKey: kp1.publicKey });
    expect(await vault.hasKeyPair({ publicKey: kp2.publicKey })).toBe(true);
  });

  it('succeeds for a key pair the vault does not hold', async () => {
    const vault = createMemoryVault();
    const kp = randomMlDsa65KeyPair();

    const byPublicKey = await vault.safeDeleteKeyPair({ publicKey: kp.publicKey });
    expect(byPublicKey.success).toBe(true);

    const byPublicKeyId = await vault.safeDeleteKeyPair({ publicKeyId: kp.publicKeyId });
    expect(byPublicKeyId.success).toBe(true);
  });

  it('rejects an invalid public key with Args.InvalidSchema', async () => {
    const vault = createMemoryVault();

    const result = await vault.safeDeleteKeyPair({
      // @ts-expect-error
      publicKey: 1,
    });
    assertNatErrKind(result, 'MemoryVault.DeleteKeyPair.Args.InvalidSchema');
  });

  it('rejects a full ml-dsa-65 public key given as an id with Args.InvalidSchema', async () => {
    const kp = randomMlDsa65KeyPair();
    const vault = createMemoryVault({ privateKey: kp.privateKey });

    const result = await vault.safeDeleteKeyPair({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: kp.publicKey,
    });
    assertNatErrKind(result, 'MemoryVault.DeleteKeyPair.Args.InvalidSchema');
    expect(await vault.hasKeyPair({ publicKey: kp.publicKey })).toBe(true);
  });
});
