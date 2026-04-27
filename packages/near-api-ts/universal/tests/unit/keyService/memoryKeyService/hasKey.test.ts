import { describe, expect, it } from 'vitest';
import { createMemoryKeyService, randomEd25519KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('MemoryKeyService', () => {
  it('HasKey - ok > true', async () => {
    const kp1 = randomEd25519KeyPair();

    const keyService = createMemoryKeyService({
      keySource: { privateKey: kp1.privateKey },
    });
    const result = await keyService.hasKey({ publicKey: kp1.publicKey });
    expect(result).toBe(true);
  });

  it('HasKey - ok > false', async () => {
    const keyService = createMemoryKeyService({
      keySource: { privateKey: randomEd25519KeyPair().privateKey },
    });
    const result = await keyService.hasKey({
      publicKey: randomEd25519KeyPair().publicKey,
    });
    expect(result).toBe(false);
  });

  it('HasKey - err > Args.InvalidSchema', async () => {
    const keyService = createMemoryKeyService({
      keySource: { privateKey: randomEd25519KeyPair().privateKey },
    });

    const result = await keyService.safeHasKey({
      // @ts-expect-error
      publicKey: 1,
    });
    assertNatErrKind(result, 'MemoryKeyService.HasKey.Args.InvalidSchema')
  });
});
