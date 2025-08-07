import * as v from 'valibot';
import type { Curve, CurveString } from 'nat-types/crypto';
import { base58 } from '@scure/base';

export const CurveStringSchema = v.pipe(
  v.string(),
  v.regex(
    /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
    'Invalid elliptic curve string format, expected <curve>:<base58>',
  ),
  v.transform((value) => value as CurveString),
);

export const CurveStringTransformSchema = v.pipe(
  CurveStringSchema,
  v.transform((value) => {
    const [curve, base58String] = value.split(':');
    return {
      curve: curve as Curve,
      u8Data: base58.decode(base58String),
    };
  }),
);
