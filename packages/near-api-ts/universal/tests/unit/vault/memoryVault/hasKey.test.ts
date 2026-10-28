import { describe, expect, it } from 'vitest';
import { createMemoryVault, randomEd25519KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('memoryVault.hasKey', () => {
  it('returns true when the key is present', async () => {
    const kp1 = randomEd25519KeyPair();

    const keyVault = createMemoryVault({
      keySource: { privateKey: kp1.privateKey },
    });
    const result = await keyVault.hasKey({ publicKey: kp1.publicKey });
    expect(result).toBe(true);
  });

  it('returns false when the key is absent', async () => {
    const keyVault = createMemoryVault({
      keySource: { privateKey: randomEd25519KeyPair().privateKey },
    });
    const result = await keyVault.hasKey({
      publicKey: randomEd25519KeyPair().publicKey,
    });
    expect(result).toBe(false);
  });

  it('rejects an invalid public key with Args.InvalidSchema', async () => {
    const keyVault = createMemoryVault({
      keySource: { privateKey: randomEd25519KeyPair().privateKey },
    });

    const result = await keyVault.safeHasKey({
      // @ts-expect-error
      publicKey: 1,
    });
    assertNatErrKind(result, 'MemoryVault.HasKey.Args.InvalidSchema');
  });
});
