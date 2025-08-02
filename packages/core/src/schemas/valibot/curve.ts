import * as v from 'valibot';

export const curveSchema = v.picklist(['ed25519', 'secp256k1']);

export const curveStringSchema = v.pipe(
  v.string(),
  v.regex(
    /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid elliptic curve string format, expected {curve}:{base58}',
  ),
  v.transform((value) => {
    const [curve, base58String] = value.split(':');
    return {
      curve: v.parse(curveSchema, curve),
      base58String,
    };
  }),
);
