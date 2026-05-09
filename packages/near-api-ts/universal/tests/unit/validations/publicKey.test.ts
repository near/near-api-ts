import { describe, expect, it } from 'vitest';
import { PublicKeyZodSchema } from '../../../src/_common/schemas/zod/common/publicKey';

const privateKey =
  'ed25519:3kDMsPd8EsgPNV2yarJFtKMvCtV4fN4MkwhaW5BXcNx4a2NhMjE8ycVb3Vu1yrhqZc31dCPHNNUYJV3UK9GbFFd6';
const publicKey = 'ed25519:AkTn58AmaJcF7L15WqKUUfm8fv5gwzSymHXg3EDRpC44';

describe('PublicKey', () => {
  it('Ok', () => {
    const res = PublicKeyZodSchema.safeParse(publicKey);
    console.log(res);
  });
  it('Err', () => {
    const res = PublicKeyZodSchema.safeParse(privateKey);
    console.log(res);
    expect(res.success).toBe(false);
  });
});
