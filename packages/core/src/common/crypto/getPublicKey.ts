import * as v from 'valibot';
import type { PublicKey, PrivateKey } from 'nat-types/crypto';
import { toCurveString, fromCurveString } from './curveString';
import {
  binarySecp256k1PrivateKeySchema,
  binaryEd25519PrivateKeySchema,
} from 'nat-schemas/valibot';

const getEd25519PublicKey = (u8PrivateKey: Uint8Array) => {
  const { u8PublicKey } = v.parse(binaryEd25519PrivateKeySchema, u8PrivateKey);
  return toCurveString('ed25519', u8PublicKey);
};

const getSecp256k1PublicKey = (u8PrivateKey: Uint8Array) => {
  const { u8PublicKey } = v.parse(
    binarySecp256k1PrivateKeySchema,
    u8PrivateKey,
  );
  return toCurveString('secp256k1', u8PublicKey);
};

export const getPublicKey = (privateKey: PrivateKey): PublicKey => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? getEd25519PublicKey(u8PrivateKey)
    : getSecp256k1PublicKey(u8PrivateKey);
};
