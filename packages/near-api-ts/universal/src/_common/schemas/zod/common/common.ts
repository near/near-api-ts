import * as z from 'zod/mini';
import { CryptoHashZodSchema } from './cryptoHash';

export const BlockHashZodSchema = CryptoHashZodSchema;
export const BlockHeightZodSchema = z.number().check(z.nonnegative());
export const BlockIdZodSchema = z.union([BlockHeightZodSchema, BlockHashZodSchema]);

export const TransactionNonceZodSchema = z.number().check(z.int(), z.nonnegative());

export const ContractFunctionNameZodSchema = z.string().check(z.minLength(1), z.maxLength(256));

export const JsonValueZodSchema = z.json();
