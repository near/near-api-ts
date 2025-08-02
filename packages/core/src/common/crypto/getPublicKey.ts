import type { PublicKey, PrivateKey } from '@types';
import { BinaryCryptoKeyLengths } from '../../configs/constants';
import { toCurveString, fromCurveString } from './curveString';

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);

  if (curve === 'secp256k1') {
    return toCurveString(
      curve,
      u8PrivateKey.slice(BinaryCryptoKeyLengths.Secp256k1.SecretKey), // public key = last 64 bytes
    );
  }

  return toCurveString(
    curve,
    u8PrivateKey.slice(BinaryCryptoKeyLengths.Ed25519.SecretKey), // public key = last 32 bytes
  );
};
