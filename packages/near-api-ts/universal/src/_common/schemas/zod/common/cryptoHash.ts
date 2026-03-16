import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import { Base58StringSchema } from '@universal/src/_common/schemas/zod/common/base58String';

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
