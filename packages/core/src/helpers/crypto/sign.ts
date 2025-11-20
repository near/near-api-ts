import type { PrivateKey, Signature } from 'nat-types/crypto';
import type { Hex } from 'nat-types/common';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import {
  fromCurveString,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';

const signByEd25519Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(
    0,
    BinaryCryptoKeyLengths.Ed25519.SecretKey,
  );
  const u8Signature = ed25519.sign(message, u8SecretKey);
  return {
    signature: toEd25519CurveString(u8Signature),
    u8Signature,
  };
};

const signBySecp256k1Key = (message: Hex, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(
    0,
    BinaryCryptoKeyLengths.Secp256k1.SecretKey,
  );
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

type SignResult = {
  signature: Signature;
  u8Signature: Uint8Array;
};

export const sign = (args: SignArgs): SignResult => {
  const { curve, u8Data: u8PrivateKey } = fromCurveString(args.privateKey);
  return curve === 'ed25519'
    ? signByEd25519Key(args.message, u8PrivateKey)
    : signBySecp256k1Key(args.message, u8PrivateKey);
};
