import * as z from 'zod/mini';
import { CryptoHashSchema } from '@common/schemas/zod/common/cryptoHash';

export const BlockHashSchema = CryptoHashSchema;
export const BlockHeightSchema = z.number().check(z.positive());
export const BlockIdSchema = z.union([BlockHeightSchema, BlockHashSchema]);

export const NonceSchema = z.number().check(z.int(), z.nonnegative());

export const ContractFunctionNameSchema = z
  .string()
  .check(z.minLength(1), z.maxLength(256));
