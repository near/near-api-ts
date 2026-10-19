import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import {
  createMemoryKeyVault,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryKeyVault.findPublicKey', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const keyVault = createMemoryKeyVault({
    keySources: [ed25519KeyPair, mlDsa65KeyPair],
  });

  it('finds an ed25519 key by its ref', async () => {
    const publicKey = await keyVault.findPublicKey({ publicKeyRef: ed25519KeyPair.publicKeyRef });
    expect(publicKey).toBe(ed25519KeyPair.publicKey);
  });

  it('finds an ml-dsa-65 key by its hash', async () => {
    const publicKey = await keyVault.findPublicKey({ publicKeyRef: mlDsa65KeyPair.publicKeyRef });
    expect(publicKey).toBe(mlDsa65KeyPair.publicKey);
  });

  it('returns undefined when the key is absent', async () => {
    const publicKey = await keyVault.findPublicKey({
      publicKeyRef: randomMlDsa65KeyPair().publicKeyRef,
    });
    expect(publicKey).toBeUndefined();
  });

  it('rejects a full ml-dsa-65 public key with Args.InvalidSchema', async () => {
    const result = await keyVault.safeFindPublicKey({
      // @ts-expect-error a full ml-dsa-65 public key is not a ref
      publicKeyRef: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'MemoryKeyVault.FindPublicKey.Args.InvalidSchema');
  });

  it('rejects a ref of the wrong length with Args.InvalidSchema', async () => {
    const result = await keyVault.safeFindPublicKey({
      publicKeyRef: `ml-dsa-65-hash:${base58.encode(new Uint8Array(31).fill(7))}`,
    });
    assertNatErrKind(result, 'MemoryKeyVault.FindPublicKey.Args.InvalidSchema');
  });
});
