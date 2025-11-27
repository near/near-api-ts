import {describe, expect, it} from 'vitest';
import {safeKeyPair} from '../../../../src';

const privateKey =
  'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6';
const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

describe('KeyPair', () => {
  it('Safe creation', () => {
    const kp1 = safeKeyPair(privateKey);

    expect(kp1.ok).toBe(true);

    if (kp1.ok) {
      expect(kp1.value.publicKey).toBe(publicKey);
    }
  });

  it('CreateKeyPair.PrivateKey.InvalidCurveString error', () => {
    //@ts-expect-error
    const kp1 = safeKeyPair('123');

    expect(kp1.ok).toBe(false);
    //@ts-ignore
    expect(kp1?.error?.kind).toBe(
      'CreateKeyPair.PrivateKey.InvalidCurveString',
    );
  });
});
