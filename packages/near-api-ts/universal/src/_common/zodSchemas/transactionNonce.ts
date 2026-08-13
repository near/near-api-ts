import * as z from 'zod/mini';

export const TransactionNonceZodSchema = z.number().check(z.int(), z.nonnegative());
