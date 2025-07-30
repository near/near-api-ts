import {
  type PrivateKey,
  PrivateKeySchema,
  CryptoKeyLengths,
} from '@near-api-ts/types';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { fromCurveString, toCurveString } from './curveString';

const signByEd25519Key = (message: Uint8Array, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(0, CryptoKeyLengths.Ed25519.SecretKey);
  const u8Signature = ed25519.sign(message, u8SecretKey);
  return toCurveString('ed25519', u8Signature);
};

const signBySecp256k1Key = (message: Uint8Array, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(
    0,
    CryptoKeyLengths.Secp256k1.SecretKey,
  );
  const signature = secp256k1.sign(message, u8SecretKey);

  return toCurveString(
    'secp256k1',
    new Uint8Array([...signature.toBytes(), signature.recovery]),
  );
};

type SignArgs = {
  message: Uint8Array;
  privateKey: PrivateKey;
};

export const sign = ({ message, privateKey }: SignArgs) => {
  PrivateKeySchema.parse(privateKey);
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  if (curve === 'secp256k1') return signBySecp256k1Key(message, u8PrivateKey);
  return signByEd25519Key(message, u8PrivateKey);
};
