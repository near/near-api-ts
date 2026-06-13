import { describe, expect, it } from 'vitest';
import { keyPair, randomSecp256k1KeyPair } from '../../../../index';

describe('randomSecp256k1KeyPair', () => {
  it('generates a valid secp256k1 key pair', async () => {
    const randomKey = randomSecp256k1KeyPair();
    const fromRandom = keyPair(randomKey.privateKey);
    console.log(randomKey);

    expect(fromRandom.publicKey).toBe(randomKey.publicKey);

    const x = await randomKey.signData({ dataU8: Uint8Array.from('48656c6c6f20776f726c6421') });
    console.log(x);
  });
});
