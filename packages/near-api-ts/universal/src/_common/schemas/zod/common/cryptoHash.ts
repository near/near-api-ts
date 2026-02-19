import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import { oneLine } from '../../../utils/common';

const Base58StringSchema = z.string().check(
  z.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    oneLine(`Base58 string contains invalid characters. Allowed characters:
    123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`),
  ),
);

export const CryptoHashSchema = z
  .pipe(
    Base58StringSchema,
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
