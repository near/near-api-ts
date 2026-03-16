import * as z from 'zod/mini';
import { oneLine } from '../../../utils/common';

export const Base58StringSchema = z.string().check(
  z.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    oneLine(`Base58 string contains invalid characters. Allowed characters:
    123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`),
  ),
);
