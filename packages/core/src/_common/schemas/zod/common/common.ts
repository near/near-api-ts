import * as z from 'zod/mini';
import { oneLine } from '@common/utils/common';
import { CryptoHashSchema } from '@common/schemas/zod/common/cryptoHash';

export const Base58StringSchema = z.string().check(
  z.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    oneLine(`Base58 string contains invalid characters. Allowed characters:
    123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`),
  ),
);

export const CurveStringSchema = z.templateLiteral(
  [z.enum(['ed25519', 'secp256k1']), ':', Base58StringSchema],
  {
    error: oneLine(`Curve strings should use the 
      ed25519:<base58String> or secp256k1:<base58String> format.`),
  },
);

export const BlockHashSchema = CryptoHashSchema;
export const BlockHeightSchema = z.number().check(z.positive());
export const BlockIdSchema = z.union([BlockHeightSchema, BlockHashSchema]);

export const NonceSchema = z.number().check(z.positive());

export const ContractFunctionNameSchema = z
  .string()
  .check(z.minLength(1), z.maxLength(256));
