import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, randomMlDsa65KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.getPublicKey', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const keyVault = createMemoryVault({
    privateKeys: [ed25519KeyPair.privateKey, mlDsa65KeyPair.privateKey],
  });

  it('gets an ed25519 key by its id', async () => {
    const publicKey = await keyVault.getPublicKey({ publicKeyId: ed25519KeyPair.publicKeyId });
    expect(publicKey).toBe(ed25519KeyPair.publicKey);
  });

  it('gets an ml-dsa-65 key by its hash', async () => {
    const publicKey = await keyVault.getPublicKey({ publicKeyId: mlDsa65KeyPair.publicKeyId });
    expect(publicKey).toBe(mlDsa65KeyPair.publicKey);
  });

  it('returns PublicKey.NotFound when the vault does not hold the key', async () => {
    const publicKeyId = randomMlDsa65KeyPair().publicKeyId;

    const result = await keyVault.safeGetPublicKey({ publicKeyId });
    assertNatErrKind(result, 'MemoryVault.GetPublicKey.PublicKey.NotFound');
    expect(result.error.context).toEqual({ publicKeyId });
  });

  it('rejects a full ml-dsa-65 public key with Args.InvalidSchema', async () => {
    const result = await keyVault.safeGetPublicKey({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'MemoryVault.GetPublicKey.Args.InvalidSchema');
  });

  it('rejects an id of the wrong length with Args.InvalidSchema', async () => {
    const result = await keyVault.safeGetPublicKey({
      publicKeyId: `ml-dsa-65-hash:${base58.encode(new Uint8Array(31).fill(7))}`,
    });
    assertNatErrKind(result, 'MemoryVault.GetPublicKey.Args.InvalidSchema');
  });
});
