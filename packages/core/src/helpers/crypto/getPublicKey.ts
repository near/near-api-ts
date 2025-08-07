import * as v from 'valibot';
import type {
  PublicKey,
  PrivateKey,
  Ed25519CurveString,
  Secp256k1CurveString,
} from 'nat-types/crypto';
import {
  fromCurveString,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString';
import {
  BinarySecp256k1PrivateKeySchema,
  BinaryEd25519PrivateKeySchema,
} from '@common/schemas/valibot/privateKey';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getBinaryEd25519PublicKey = (
  u8Ed25519PrivateKey: Uint8Array,
): Uint8Array => {
  const validEd25519PrivateKey = v.parse(
    BinaryEd25519PrivateKeySchema,
    u8Ed25519PrivateKey,
  );
  return validEd25519PrivateKey.slice(Ed25519.SecretKey);
};

const getEd25519PublicKey = (u8PrivateKey: Uint8Array): Ed25519CurveString => {
  const u8PublicKey = getBinaryEd25519PublicKey(u8PrivateKey);
  return toEd25519CurveString(u8PublicKey);
};

const getBinarySecp256k1PublicKey = (
  u8Secp256k1PrivateKey: Uint8Array,
): Uint8Array => {
  const validU8PrivateKey = v.parse(
    BinarySecp256k1PrivateKeySchema,
    u8Secp256k1PrivateKey,
  );
  return validU8PrivateKey.slice(Secp256k1.SecretKey);
};

const getSecp256k1PublicKey = (
  u8Secp256k1PrivateKey: Uint8Array,
): Secp256k1CurveString => {
  const u8PublicKey = getBinarySecp256k1PublicKey(u8Secp256k1PrivateKey);
  return toSecp256k1CurveString(u8PublicKey);
};

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? getEd25519PublicKey(u8PrivateKey)
    : getSecp256k1PublicKey(u8PrivateKey);
};
