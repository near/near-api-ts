import { base58 } from '@scure/base';
import {
  EllipticCurveSchema,
  type EllipticCurveString,
  type EllipticCurve,
} from '@near-api-ts/types';

export const toCurveString = (
  curve: EllipticCurve,
  u8Data: Uint8Array,
): EllipticCurveString => `${curve}:${base58.encode(u8Data)}`;

export const fromCurveString = (value: EllipticCurveString) => {
  const [curve, curvelessData] = value.split(':');
  // TODO add validation for curvelessData - should follow the 'curve:data' pattern
  return {
    curve: EllipticCurveSchema.parse(curve),
    u8Data: base58.decode(curvelessData),
  };
};
