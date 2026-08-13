import { base58 } from '@scure/base';
import * as z from 'zod/mini';

const Base58StringZodSchema = z
  .string()
  .check(
    z.regex(
      /^[1-9A-HJ-NP-Za-km-z]+$/,
      `Base58 string contains invalid characters. Allowed characters: ` +
        `123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
    ),
  );

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
