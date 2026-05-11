import { base58 } from '@scure/base';
import * as z from 'zod/mini';
import type { Curve, CurveString } from '../../../../../types/_common/curveString';
import { oneLine } from '../../../utils/common';

export const CurveStringZodSchema = z.pipe(
  z.string().check(
    z.regex(
      /^(ed25519|secp256k1):[1-9A-HJ-NP-Za-km-z]+$/,
      oneLine(`Curve strings should use the 
      ed25519:<base58String> or secp256k1:<base58String> format.`),
    ),
  ),
  z.transform((curveString: CurveString) => {
    const [curve, dataBase58] = curveString.split(':');
    return {
      curveString,
      curve: curve as Curve,
      dataU8: base58.decode(dataBase58),
    };
  }),
);
