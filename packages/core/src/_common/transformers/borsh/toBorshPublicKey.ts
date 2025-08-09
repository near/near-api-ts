import type { PublicKey, NativePublicKey } from 'nat-types/crypto';
import { fromCurveString } from '@common/transformers/curveString';

export const toBorshPublicKey = (publicKey: PublicKey): NativePublicKey => {
  const { curve, u8Data } = fromCurveString(publicKey);
  if (curve === 'ed25519') return { ed25519Key: { data: u8Data } };
  return { secp256k1Key: { data: u8Data } };
};
