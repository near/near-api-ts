import * as v from 'valibot';

export const Base58StringSchema = v.pipe(
  v.string(),
  v.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    `Base58 string contains invalid characters. Allowed characters:\
     123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
  ),
);


