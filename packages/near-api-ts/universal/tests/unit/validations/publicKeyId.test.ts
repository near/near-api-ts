import { base58 } from '@scure/base';
import { describe, expect, it } from 'vitest';
import { randomEd25519KeyPair, randomMlDsa65KeyPair, randomSecp256k1KeyPair } from '../../../index';
import { PublicKeyIdZodSchema } from '../../../src/_common/zodSchemas/publicKeyId';

const bytes = (length: number) => base58.encode(new Uint8Array(length).fill(7));

describe('PublicKeyIdZodSchema', () => {
  it('accepts the id of every curve and returns it unchanged', () => {
    for (const { publicKeyId } of [
      randomEd25519KeyPair(),
      randomSecp256k1KeyPair(),
      randomMlDsa65KeyPair(),
    ]) {
      expect(PublicKeyIdZodSchema.parse(publicKeyId)).toBe(publicKeyId);
    }
  });

  it('rejects an id of the wrong length', () => {
    for (const id of [
      `ed25519:${bytes(31)}`,
      `secp256k1:${bytes(32)}`,
      `ml-dsa-65-hash:${bytes(31)}`,
      `ml-dsa-65-hash:${bytes(33)}`,
    ]) {
      expect(PublicKeyIdZodSchema.safeParse(id).success).toBe(false);
    }
  });

  it('rejects anything that is not an id', () => {
    for (const value of [
      randomMlDsa65KeyPair().publicKey, // a full ml-dsa-65 key is not an id
      `ml-dsa-65:${bytes(32)}`,
      `sha256:${bytes(32)}`,
      'ed25519:0OIl',
      'ed25519',
      1,
    ]) {
      expect(PublicKeyIdZodSchema.safeParse(value).success).toBe(false);
    }
  });
});
