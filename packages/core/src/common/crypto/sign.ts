import * as v from 'valibot';
import type { PrivateKey, Hex } from 'nat-types';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
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

const getBinaryEd25519SecretKey = (u8PrivateKey: Uint8Array) =>
  v
    .parse(BinaryEd25519PrivateKeySchema, u8PrivateKey)
    .slice(0, Ed25519.SecretKey);

const signByEd25519Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = getBinaryEd25519SecretKey(u8PrivateKey);
  const u8Signature = ed25519.sign(message, u8SecretKey);

  return {
    signature: toEd25519CurveString(u8Signature),
    u8Signature,
  };
};

const getBinarySecp256k1SecretKey = (u8PrivateKey: Uint8Array) =>
  v
    .parse(BinarySecp256k1PrivateKeySchema, u8PrivateKey)
    .slice(0, Secp256k1.SecretKey);

const signBySecp256k1Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = getBinarySecp256k1SecretKey(u8PrivateKey);
  const signatureObj = secp256k1.sign(message, u8SecretKey);

  const u8Signature = new Uint8Array([
    ...signatureObj.toBytes(),
    signatureObj.recovery,
  ]);

  return {
    signature: toSecp256k1CurveString(u8Signature),
    u8Signature,
  };
};

type SignArgs = {
  message: Hex;
  privateKey: PrivateKey;
};

export const sign = ({ message, privateKey }: SignArgs) => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  return curve === 'ed25519'
    ? signByEd25519Key(message, u8PrivateKey)
    : signBySecp256k1Key(message, u8PrivateKey);
};
