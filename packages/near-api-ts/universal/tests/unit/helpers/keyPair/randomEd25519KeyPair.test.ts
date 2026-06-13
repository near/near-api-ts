import { describe, expect, it } from 'vitest';
import { keyPair, randomEd25519KeyPair } from '../../../../index';

describe('randomEd25519KeyPair', () => {
  it('generates a valid ed25519 key pair', async () => {
    const randomKey = randomEd25519KeyPair();
    const fromRandom = keyPair(randomKey.privateKey);
    console.log(randomKey);
    console.log(fromRandom);

    expect(fromRandom.publicKey).toBe(randomKey.publicKey);

    const x = await randomKey.signData({ dataU8: Uint8Array.from('48656c6c6f20776f726c6421')});
    console.log(x);
  });
});
