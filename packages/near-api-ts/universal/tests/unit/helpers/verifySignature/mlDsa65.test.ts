import { expect, test } from 'vitest';
import { randomMlDsa65KeyPair, verifySignature } from '../../../../index';

test('ml-dsa-65 signature verification', async () => {
  const keyPair = randomMlDsa65KeyPair();

  const message = new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8]);

  const { signature } = await keyPair.signData({ dataU8: message });

  const isValid = verifySignature({
    publicKey: keyPair.publicKey,
    message,
    signature,
  });

  expect(isValid).toBe(true);
});

test('ml-dsa-65 rejects a signature over a different message', async () => {
  const keyPair = randomMlDsa65KeyPair();

  const { signature } = await keyPair.signData({ dataU8: new Uint8Array([1, 2, 3, 4]) });

  const isValid = verifySignature({
    publicKey: keyPair.publicKey,
    message: new Uint8Array([9, 9, 9, 9]),
    signature,
  });

  expect(isValid).toBe(false);
});
