import {
  PrivateKeySchema,
  CryptoKeyLengths,
  type PrivateKey,
  type PublicKey,
} from '@near-api-ts/types';
import { toCurveString, fromCurveString } from './curveString';

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  // TODO think how to improve it
  PrivateKeySchema.parse(privateKey);
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);

  if (curve === 'secp256k1') {
    return toCurveString(
      'secp256k1',
      u8PrivateKey.slice(CryptoKeyLengths.Secp256k1.SecretKey), // public key = last 64 bytes
    );
  }

  return toCurveString(
    'ed25519',
    u8PrivateKey.slice(CryptoKeyLengths.Ed25519.SecretKey), // public key = last 32 bytes
  );
};
