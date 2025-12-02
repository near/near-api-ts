import * as z from 'zod/mini';
import { oneLine } from '@common/utils/common';

export const AccountIdSchema = z.string().check(
  z.minLength(2),
  z.maxLength(64),
  z.regex(/^(([a-z\d]+[-_])*[a-z\d]+\.)*([a-z\d]+[-_])*[a-z\d]+$/, {
    error: oneLine(`Account ID may contain only lowercase letters (a–z), 
    digits (0–9), and separators (., -, _).`),
  }),
);
