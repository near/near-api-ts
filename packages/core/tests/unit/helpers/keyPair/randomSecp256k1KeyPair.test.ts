import {describe, expect, it} from 'vitest';
import {keyPair, randomSecp256k1KeyPair} from '../../../../src';

describe('randomSecp256k1KeyPair', () => {
  it('Ok', () => {
    const randomKey = randomSecp256k1KeyPair();
    const fromRandom = keyPair(randomKey.privateKey);
    console.log(randomKey);

    expect(fromRandom.publicKey).toBe(randomKey.publicKey);

    const x = randomKey.sign('48656c6c6f20776f726c6421');
    console.log(x);
  });
});
