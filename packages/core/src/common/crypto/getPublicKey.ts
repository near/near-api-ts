import * as v from 'valibot';
import type {
  PublicKey,
  PrivateKey,
  Ed25519CurveString,
  Secp256k1CurveString,
} from 'nat-types';
import {
  fromCurveString,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '../transformers/curveString';
import {
  BinarySecp256k1PrivateKeySchema,
  BinaryEd25519PrivateKeySchema,
} from '../schemas/valibot';
import { BinaryCryptoKeyLengths } from '../configs/constants';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getBinaryEd25519PublicKey = (u8PrivateKey: Uint8Array): Uint8Array =>
  v.parse(BinaryEd25519PrivateKeySchema, u8PrivateKey).slice(Ed25519.SecretKey);

const getEd25519PublicKey = (u8PrivateKey: Uint8Array): Ed25519CurveString => {
  const u8PublicKey = getBinaryEd25519PublicKey(u8PrivateKey);
  return toEd25519CurveString(u8PublicKey);
};

const getBinarySecp256k1PublicKey = (u8PrivateKey: Uint8Array): Uint8Array =>
  v
    .parse(BinarySecp256k1PrivateKeySchema, u8PrivateKey)
    .slice(Secp256k1.SecretKey);

const getSecp256k1PublicKey = (
  u8PrivateKey: Uint8Array,
): Secp256k1CurveString => {
  const u8PublicKey = getBinarySecp256k1PublicKey(u8PrivateKey);
  return toSecp256k1CurveString(u8PublicKey);
};

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? getEd25519PublicKey(u8PrivateKey)
    : getSecp256k1PublicKey(u8PrivateKey);
};
