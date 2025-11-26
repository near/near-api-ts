import type { Signature, NativeSignature } from 'nat-types/_common/crypto';
import { fromCurveString } from '@common/transformers/curveString/fromCurveString';

export const toNativeSignature = (signature: Signature): NativeSignature => {
  const { curve, u8Data } = fromCurveString(signature);
  // validate binary Signature length

  if (curve === 'ed25519') return { ed25519Signature: { data: u8Data } };
  return { secp256k1Signature: { data: u8Data } };
};
