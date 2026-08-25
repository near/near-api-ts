import type { NearcoreSignature, Signature } from '../../../../../types/_common/crypto';
import {
  toEd25519CurveString,
  toMlDsa65CurveString,
  toSecp256k1CurveString,
} from '../../../../_common/toCurveString';

// Borsh deserializes fixed `u8` arrays into plain number arrays, not Uint8Array.
export const fromNearcoreSignature = (nearcoreSignature: NearcoreSignature): Signature => {
  if ('ed25519Signature' in nearcoreSignature)
    return toEd25519CurveString(Uint8Array.from(nearcoreSignature.ed25519Signature.data));

  if ('secp256k1Signature' in nearcoreSignature)
    return toSecp256k1CurveString(Uint8Array.from(nearcoreSignature.secp256k1Signature.data));

  if ('mlDsa65Signature' in nearcoreSignature)
    return toMlDsa65CurveString(Uint8Array.from(nearcoreSignature.mlDsa65Signature.data));

  throw new Error(`Unsupported signature type: ${nearcoreSignature}`);
};
