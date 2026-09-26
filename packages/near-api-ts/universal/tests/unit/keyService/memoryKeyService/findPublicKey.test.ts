import { describe, expect, it } from 'vitest';
import {
  createMemoryKeyService,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryKeyService.findPublicKey', () => {
  const ed25519KeyPair = randomEd25519KeyPair();
  const mlDsa65KeyPair = randomMlDsa65KeyPair();

  const keyService = createMemoryKeyService({
    keySources: [ed25519KeyPair, mlDsa65KeyPair],
  });

  it('finds an ed25519 key by its ref', async () => {
    const publicKey = await keyService.findPublicKey({ publicKeyRef: ed25519KeyPair.publicKeyRef });
    expect(publicKey).toBe(ed25519KeyPair.publicKey);
  });

  it('finds an ml-dsa-65 key by its hash', async () => {
    const publicKey = await keyService.findPublicKey({ publicKeyRef: mlDsa65KeyPair.publicKeyRef });
    expect(publicKey).toBe(mlDsa65KeyPair.publicKey);
  });

  it('returns undefined when the key is absent', async () => {
    const publicKey = await keyService.findPublicKey({
      publicKeyRef: randomMlDsa65KeyPair().publicKeyRef,
    });
    expect(publicKey).toBeUndefined();
  });

  it('rejects a full ml-dsa-65 public key with Args.InvalidSchema', async () => {
    const result = await keyService.safeFindPublicKey({
      // @ts-expect-error a full ml-dsa-65 public key is not a ref
      publicKeyRef: mlDsa65KeyPair.publicKey,
    });
    assertNatErrKind(result, 'MemoryKeyService.FindPublicKey.Args.InvalidSchema');
  });

  it('rejects a ref of the wrong length with Args.InvalidSchema', async () => {
    const result = await keyService.safeFindPublicKey({
      publicKeyRef: `${mlDsa65KeyPair.publicKeyRef}1`,
    });
    assertNatErrKind(result, 'MemoryKeyService.FindPublicKey.Args.InvalidSchema');
  });
});
