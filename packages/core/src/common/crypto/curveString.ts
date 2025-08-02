import { base58 } from '@scure/base';
import * as v from 'valibot';
import { curveSchema, curveStringSchema } from '@schemas/valibot';
import type { Curve, CurveString } from '@types';

export const toCurveString = (curve: Curve, u8Data: Uint8Array): CurveString =>
  `${v.parse(curveSchema, curve)}:${base58.encode(u8Data)}`;

export const fromCurveString = (
  value: CurveString,
): {
  curve: Curve;
  u8Data: Uint8Array;
} => {
  const { curve, base58String } = v.parse(curveStringSchema, value);
  return { curve, u8Data: base58.decode(base58String) };
};
