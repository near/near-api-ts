import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import { Base58StringZodSchema } from './base58String';

export const CryptoHashZodSchema = z
  .pipe(
    Base58StringZodSchema,
    z.transform((cryptoHash) => {
      const u8CryptoHash = base58.decode(cryptoHash);
      return { cryptoHash, u8CryptoHash };
    }),
  )
  .check(
    z.refine(({ u8CryptoHash }) => u8CryptoHash.length === 32, {
      error: 'Crypto hash length should be 32 bytes',
    }),
  );
