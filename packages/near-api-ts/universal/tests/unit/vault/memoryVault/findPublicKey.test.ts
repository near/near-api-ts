import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair, randomMlDsa65KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.findPublicKey', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const keyVault = createMemoryVault({
    keySources: [ed25519KeyPair, mlDsa65KeyPair],
  });

  it('finds an ed25519 key by its id', async () => {
    const publicKey = await keyVault.findPublicKey({ publicKeyId: ed25519KeyPair.publicKeyId });
    expect(publicKey).toBe(ed25519KeyPair.publicKey);
  });

  it('finds an ml-dsa-65 key by its hash', async () => {
    const publicKey = await keyVault.findPublicKey({ publicKeyId: mlDsa65KeyPair.publicKeyId });
    expect(publicKey).toBe(mlDsa65KeyPair.publicKey);
  });

  it('returns undefined when the key is absent', async () => {
    const publicKey = await keyVault.findPublicKey({
      publicKeyId: randomMlDsa65KeyPair().publicKeyId,
    });
    expect(publicKey).toBeUndefined();
  });

  it('rejects a full ml-dsa-65 public key with Args.InvalidSchema', async () => {
    const result = await keyVault.safeFindPublicKey({
      // @ts-expect-error a full ml-dsa-65 public key is not an id
      publicKeyId: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'MemoryVault.FindPublicKey.Args.InvalidSchema');
  });

  it('rejects an id of the wrong length with Args.InvalidSchema', async () => {
    const result = await keyVault.safeFindPublicKey({
      publicKeyId: `ml-dsa-65-hash:${base58.encode(new Uint8Array(31).fill(7))}`,
    });
    assertNatErrKind(result, 'MemoryVault.FindPublicKey.Args.InvalidSchema');
  });
});
