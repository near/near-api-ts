import * as v from 'valibot';
import { pipe } from 'valibot';

export const base58StringSchema = pipe(
  v.string(),
  v.regex(
    /^[1-9A-HJ-NP-Za-km-z]+$/,
    `Base58 string contains invalid characters. Allowed characters:\
     123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz`,
  ),
);


// Ed25 private key length
// Secp251k1 private key length
