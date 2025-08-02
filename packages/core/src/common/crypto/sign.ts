import * as v from 'valibot';
import type { PrivateKey, Hex } from 'nat-types';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { fromCurveString, toCurveString } from './curveString';
import {
  binarySecp256k1PrivateKeySchema,
  binaryEd25519PrivateKeySchema,
} from 'nat-schemas/valibot';

const signByEd25519Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const { u8SecretKey } = v.parse(binaryEd25519PrivateKeySchema, u8PrivateKey);
  const u8Signature = ed25519.sign(message, u8SecretKey);

  return {
    signature: toCurveString('ed25519', u8Signature),
    u8Signature,
  };
};

const signBySecp256k1Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const { u8SecretKey } = v.parse(
    binarySecp256k1PrivateKeySchema,
    u8PrivateKey,
  );
  const signatureObj = secp256k1.sign(message, u8SecretKey);

  const u8Signature = new Uint8Array([
    ...signatureObj.toBytes(),
    signatureObj.recovery,
  ]);

  return {
    signature: toCurveString('secp256k1', u8Signature),
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
