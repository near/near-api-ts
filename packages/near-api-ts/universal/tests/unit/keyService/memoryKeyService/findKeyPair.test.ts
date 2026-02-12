import { describe, expect, it } from 'vitest';
import { createMemoryKeyService, randomEd25519KeyPair } from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

describe('KeyService.FindKeyPair', () => {
  it('Ok', async () => {
    const kp1 = randomEd25519KeyPair();

    const keyService = createMemoryKeyService({
      keySource: { privateKey: kp1.privateKey },
    });

    const result = keyService.findKeyPair({ publicKey: kp1.publicKey });
    expect(result.publicKey).toBe(kp1.publicKey);
  });

  it('MemoryKeyService.SignTransaction.SigningKeyPair.NotFound', async () => {
    const keyService = createMemoryKeyService({
      keySource: { privateKey: randomEd25519KeyPair().privateKey },
    });

    const res = keyService.safeFindKeyPair({
      publicKey: randomEd25519KeyPair().publicKey,
    });
    assertNatErrKind(res, 'MemoryKeyService.FindKeyPair.NotFound');
  });
});
