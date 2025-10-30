import * as z from 'zod/mini';
import { base58 } from '@scure/base';
import { oneLine } from '@common/utils/common';

const Base58StringSchema = z.string().check(
  z.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    oneLine(`Base58 string contains invalid characters. Allowed characters:
    123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`),
  ),
);

const CryptoHashSchema = Base58StringSchema.check(
  z.refine(
    (val) => {
      try {
        const bytes = base58.decode(val);
        return bytes.length === 32;
      } catch {
        return false;
      }
    },
    { error: 'CryptoHash string must decode to 32 bytes' },
  ),
);

export const BlockHashSchema = CryptoHashSchema;
export const BlockHeightSchema = z.uint64();
export const BlockIdSchema = z.union([BlockHeightSchema, BlockHashSchema]);
