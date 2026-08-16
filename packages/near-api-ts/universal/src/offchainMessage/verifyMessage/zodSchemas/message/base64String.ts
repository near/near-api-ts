import * as z from 'zod/mini';

export const Base64StringZodSchema = z.string().check(
  z.regex(
    /^[A-Za-z0-9+/]*={0,2}$/,
    `Base64 string contains invalid characters. Allowed characters: ` +
      `ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`,
  ),
  z.refine((val) => val.length % 4 === 0, 'Base64 string length must be a multiple of 4'),
);
