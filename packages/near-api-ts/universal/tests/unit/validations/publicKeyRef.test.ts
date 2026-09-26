import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { randomEd25519KeyPair, randomMlDsa65KeyPair, randomSecp256k1KeyPair } from '../../../index';
import { PublicKeyRefZodSchema } from '../../../src/_common/zodSchemas/publicKeyRef';

const bytes = (length: number) => base58.encode(new Uint8Array(length).fill(7));

describe('PublicKeyRefZodSchema', () => {
  it('accepts the ref of every curve and returns it unchanged', () => {
    for (const { publicKeyRef } of [
      randomEd25519KeyPair(),
      randomSecp256k1KeyPair(),
      randomMlDsa65KeyPair(),
    ]) {
      expect(PublicKeyRefZodSchema.parse(publicKeyRef)).toBe(publicKeyRef);
    }
  });

  it('rejects a ref of the wrong length', () => {
    for (const ref of [
      `ed25519:${bytes(31)}`,
      `secp256k1:${bytes(32)}`,
      `ml-dsa-65-hash:${bytes(31)}`,
      `ml-dsa-65-hash:${bytes(33)}`,
    ]) {
      expect(PublicKeyRefZodSchema.safeParse(ref).success).toBe(false);
    }
  });

  it('rejects anything that is not a ref', () => {
    for (const value of [
      randomMlDsa65KeyPair().publicKey, // a full ml-dsa-65 key is not a ref
      `ml-dsa-65:${bytes(32)}`,
      `sha256:${bytes(32)}`,
      'ed25519:0OIl',
      'ed25519',
      1,
    ]) {
      expect(PublicKeyRefZodSchema.safeParse(value).success).toBe(false);
    }
  });
});
