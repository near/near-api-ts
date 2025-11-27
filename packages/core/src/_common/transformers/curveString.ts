import { base58 } from '@scure/base';
import type {
  Curve,
  Ed25519CurveString,
  FromCurveString,
  Secp256k1CurveString,
} from 'nat-types/_common/curveString';

export const fromCurveString: FromCurveString = (value) => {
  const [curve, base58String] = value.split(':');
  return {
    curve: curve as Curve,
    u8Data: base58.decode(base58String),
  };
};

export const toEd25519CurveString = (u8Data: Uint8Array): Ed25519CurveString =>
  `ed25519:${base58.encode(u8Data)}`;

export const toSecp256k1CurveString = (
  u8Data: Uint8Array,
): Secp256k1CurveString => `secp256k1:${base58.encode(u8Data)}`;
