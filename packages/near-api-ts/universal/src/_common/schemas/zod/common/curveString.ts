import * as z from 'zod/mini';
import { oneLine } from '../../../utils/common';
import type { Curve, CurveString } from '../../../../../types/_common/curveString';
import { base58 } from '@scure/base';

export const CurveStringSchema = z.pipe(
  z.string().check(
    z.regex(
      /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
      oneLine(`Curve strings should use the 
      ed25519:<base58String> or secp256k1:<base58String> format.`),
    ),
  ),
  z.transform((curveString: CurveString) => {
    const [curve, base58String] = curveString.split(':');
    return {
      curveString,
      curve: curve as Curve,
      u8Data: base58.decode(base58String),
    };
  }),
);
