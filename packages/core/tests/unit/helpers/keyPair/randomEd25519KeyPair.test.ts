import { expect, describe, it } from 'vitest';
import { keyPair, randomEd25519KeyPair } from '../../../../src';

describe('randomEd25519KeyPair', () => {
  it('Ok', () => {
    const randomKey = randomEd25519KeyPair();
    const fromRandom = keyPair(randomKey.privateKey);
    console.log(randomKey);
    console.log(fromRandom);

    expect(fromRandom.publicKey).toBe(randomKey.publicKey);

    const x = randomKey.sign('48656c6c6f20776f726c6421');
    console.log(x);
  });
});
