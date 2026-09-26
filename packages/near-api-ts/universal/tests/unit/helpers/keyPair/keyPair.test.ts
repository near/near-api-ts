import { describe, expect, it } from 'vitest';
import {
  keyPair,
  randomEd25519KeyPair,
  randomMlDsa65KeyPair,
  randomSecp256k1KeyPair,
  safeKeyPair,
} from '../../../../index';
import { assertNatErrKind } from '../../../utils/assertNatErrKind';

const privateKey =
  'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6';
const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

describe('keyPair', () => {
  it('creates a key pair from a valid private key', () => {
    const kp1 = safeKeyPair(privateKey);

    expect(kp1.success).toBe(true);

    if (kp1.success) {
      expect(kp1.data.publicKey).toBe(publicKey);
    }
  });

  it('rejects malformed keys with CreateKeyPair.Args.InvalidSchema', () => {
    const kp1 = safeKeyPair('123');
    assertNatErrKind(kp1, 'CreateKeyPair.Args.InvalidSchema');

    const kp2 = safeKeyPair('ed225519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44');
    assertNatErrKind(kp2, 'CreateKeyPair.Args.InvalidSchema');

    const kp3 = safeKeyPair('ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44');
    assertNatErrKind(kp3, 'CreateKeyPair.Args.InvalidSchema');

    const kp4 = safeKeyPair('ed25519:№?');
    assertNatErrKind(kp4, 'CreateKeyPair.Args.InvalidSchema');
  });

  it('refers to an ed25519 or secp256k1 key by the public key itself', () => {
    for (const randomKeyPair of [randomEd25519KeyPair(), randomSecp256k1KeyPair()]) {
      const kp = keyPair(randomKeyPair.privateKey);
      expect(kp.publicKeyRef).toBe(kp.publicKey);
      expect(randomKeyPair.publicKeyRef).toBe(randomKeyPair.publicKey);
    }
  });

  it('refers to an ml-dsa-65 key by its hash', () => {
    const randomKeyPair = randomMlDsa65KeyPair();
    const kp = keyPair(randomKeyPair.privateKey);

    expect(randomKeyPair.publicKeyRef).toMatch(/^ml-dsa-65-hash:[1-9A-HJ-NP-Za-km-z]+$/);
    expect(kp.publicKeyRef).toBe(randomKeyPair.publicKeyRef);
    expect(randomMlDsa65KeyPair().publicKeyRef).not.toBe(randomKeyPair.publicKeyRef);
  });
});
