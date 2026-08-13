import * as z from 'zod/mini';

export const AccountIdZodSchema = z.string().check(
  z.minLength(2),
  z.maxLength(64),
  z.regex(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/, {
    error:
      `Account ID may contain only lowercase letters (a–z), ` +
      `digits (0–9), and separators (., -, _).`,
  }),
);
