import * as z from 'zod/mini';
import { CryptoHashSchema } from './cryptoHash';

export const BlockHashSchema = CryptoHashSchema;
export const BlockHeightSchema = z.number().check(z.nonnegative());
export const BlockIdSchema = z.union([BlockHeightSchema, BlockHashSchema]);

export const NonceSchema = z.number().check(z.int(), z.nonnegative());

export const ContractFunctionNameSchema = z
  .string()
  .check(z.minLength(1), z.maxLength(256));

// TODO Zod doesn't allow to pass objects with undefined fields
//  like { a: 1, b: undefined }. But our types allow it. Need to fix zod schema.
export const JsonSchema = z.json();
