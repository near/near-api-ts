import * as z from 'zod/mini';
import { CryptoHashZodSchema } from './cryptoHash';

export const BlockHashZodSchema = CryptoHashZodSchema;
export const BlockHeightZodSchema = z.number().check(z.nonnegative());
export const BlockIdZodSchema = z.union([BlockHeightZodSchema, BlockHashZodSchema]);

export const TransactionNonceZodSchema = z.number().check(z.int(), z.nonnegative());

// No upper bound on the length: `max_length_method_name` lives in the protocol config and can
// change, so the node is left to be the one that rejects an over-long name.
export const ContractFunctionNameZodSchema = z.string().check(z.minLength(1));

export const JsonValueZodSchema = z.json();
