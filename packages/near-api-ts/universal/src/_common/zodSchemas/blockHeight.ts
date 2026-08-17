import * as z from 'zod/mini';

export const BlockHeightZodSchema = z.number().check(z.nonnegative());
