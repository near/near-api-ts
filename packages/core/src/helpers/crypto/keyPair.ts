import type {PrivateKey, PublicKey} from 'nat-types/crypto';
import {BinaryCryptoKeyLengths} from '@common/configs/constants';
import {
  toEd25519CurveString,
  toSecp256k1CurveString
} from '@common/transformers/curveString/toCurveString';
import {
  fromCurveString
} from '@common/transformers/curveString/fromCurveString';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getEd25519PublicKey = (u8PrivateKey: Uint8Array) => {
  // check binary length
  const u8PublicKey = u8PrivateKey.slice(Ed25519.SecretKey);
  return toEd25519CurveString(u8PublicKey);
};

const getSecp256k1PublicKey = (u8PrivateKey: Uint8Array) => {
  const u8PublicKey = u8PrivateKey.slice(Secp256k1.SecretKey);
  return toSecp256k1CurveString(u8PublicKey);
};

const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  // TODO validate private key
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? getEd25519PublicKey(u8PrivateKey)
    : getSecp256k1PublicKey(u8PrivateKey);
};

const ed25519Key = {};
const secp256k1Key = {};

const keyPair = (privateKey: PrivateKey) => {};
