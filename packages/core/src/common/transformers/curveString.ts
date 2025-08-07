import { base58 } from '@scure/base';
import * as v from 'valibot';
import { CurveStringTransformSchema } from '../schemas/valibot';
import type {
  Curve,
  CurveString,
  Ed25519CurveString,
  Secp256k1CurveString,
} from 'nat-types/common/crypto';

export const toEd25519CurveString = (u8Data: Uint8Array): Ed25519CurveString =>
  `ed25519:${base58.encode(u8Data)}`;

export const toSecp256k1CurveString = (
  u8Data: Uint8Array,
): Secp256k1CurveString => `secp256k1:${base58.encode(u8Data)}`;

export const fromCurveString = (
  value: CurveString,
): {
  curve: Curve;
  u8Data: Uint8Array;
} => v.parse(CurveStringTransformSchema, value);
