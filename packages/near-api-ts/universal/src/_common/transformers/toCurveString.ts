import { base58 } from '@scure/base';
import type {
  Ed25519CurveString,
  MlDsa65CurveString,
  Secp256k1CurveString,
} from '../../../types/_common/curveString';

export const toEd25519CurveString = (dataU8: Uint8Array): Ed25519CurveString =>
  `ed25519:${base58.encode(dataU8)}`;

export const toSecp256k1CurveString = (dataU8: Uint8Array): Secp256k1CurveString =>
  `secp256k1:${base58.encode(dataU8)}`;

export const toMlDsa65CurveString = (dataU8: Uint8Array): MlDsa65CurveString =>
  `ml-dsa-65:${base58.encode(dataU8)}`;
