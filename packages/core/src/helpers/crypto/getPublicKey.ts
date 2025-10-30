import {
  fromCurveString,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import type { PublicKey, PrivateKey } from 'nat-types/crypto';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getEd25519PublicKey = (u8PrivateKey: Uint8Array) => {
  const u8PublicKey = u8PrivateKey.slice(Ed25519.SecretKey);
  return toEd25519CurveString(u8PublicKey);
};

const getSecp256k1PublicKey = (u8PrivateKey: Uint8Array) => {
  const u8PublicKey = u8PrivateKey.slice(Secp256k1.SecretKey);
  return toSecp256k1CurveString(u8PublicKey);
};

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  // TODO validate private key
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? getEd25519PublicKey(u8PrivateKey)
    : getSecp256k1PublicKey(u8PrivateKey);
};
