import type { Signature, NativeSignature } from 'nat-types/crypto';
import { fromCurveString } from '@common/transformers/curveString';

export const toNativeSignature = (signature: Signature): NativeSignature => {
  const { curve, u8Data } = fromCurveString(signature);
  if (curve === 'ed25519') return { ed25519Signature: { data: u8Data } };
  return { secp256k1Signature: { data: u8Data } };
};
