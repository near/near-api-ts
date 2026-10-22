import * as z from 'zod/mini';

export const NonceZodSchema = z.number().check(z.int(), z.nonnegative());
