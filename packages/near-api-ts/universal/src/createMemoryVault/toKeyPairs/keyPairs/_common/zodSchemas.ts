import * as z from 'zod/mini';

export const SignDataArgsZodSchema = z.object({
  dataU8: z.instanceof(Uint8Array),
});
