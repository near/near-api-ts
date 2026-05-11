import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import { Base58StringZodSchema } from './base58String';

export const CryptoHashZodSchema = z
  .pipe(
    Base58StringZodSchema,
    z.transform((cryptoHash) => {
      const cryptoHashU8 = base58.decode(cryptoHash);
      return { cryptoHash, cryptoHashU8: cryptoHashU8 };
    }),
  )
  .check(
    z.refine(({ cryptoHashU8 }) => cryptoHashU8.length === 32, {
      error: 'Crypto hash length should be 32 bytes',
    }),
  );
