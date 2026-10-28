import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, randomMlDsa65KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.addKeyPair', () => {
  it('adds a key pair the vault then signs with', async () => {
    const kp = randomEd25519KeyPair();
    const vault = createMemoryVault();

    const added = await vault.addKeyPair({ privateKey: kp.privateKey });
    expect(added).toEqual({ publicKey: kp.publicKey, publicKeyId: kp.publicKeyId });
    expect(await vault.hasKeyPair({ publicKey: kp.publicKey })).toBe(true);

    const dataU8 = new Uint8Array(32).fill(1);
    const signedData = await vault.signData({ publicKey: kp.publicKey, dataU8 });
    expect(signedData.signature).toBe((await kp.signData({ dataU8 })).signature);
  });

  it('returns the id an account lists an ml-dsa-65 key under', async () => {
    const kp = randomMlDsa65KeyPair();
    const vault = createMemoryVault();

    const added = await vault.addKeyPair({ privateKey: kp.privateKey });
    expect(added).toEqual({ publicKey: kp.publicKey, publicKeyId: kp.publicKeyId });
    expect(await vault.getPublicKey({ publicKeyId: added.publicKeyId })).toBe(kp.publicKey);
  });

  it('keeps holding a key pair added again', async () => {
    const kp = randomEd25519KeyPair();
    const vault = createMemoryVault({ privateKey: kp.privateKey });

    const added = await vault.addKeyPair({ privateKey: kp.privateKey });
    expect(added.publicKey).toBe(kp.publicKey);
    expect(await vault.hasKeyPair({ publicKey: kp.publicKey })).toBe(true);
  });

  it('rejects a private key of the wrong length with Args.InvalidSchema', async () => {
    const vault = createMemoryVault();

    const result = await vault.safeAddKeyPair({
      privateKey: `ed25519:${base58.encode(new Uint8Array(31).fill(7))}`,
    });
    assertNatErrKind(result, 'MemoryVault.AddKeyPair.Args.InvalidSchema');
  });
});
