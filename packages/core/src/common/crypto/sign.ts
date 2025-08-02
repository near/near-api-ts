import type { PrivateKey } from '@types';
import { ed25519 } from '@noble/curves/ed25519';
import { secp256k1 } from '@noble/curves/secp256k1';
import { fromCurveString, toCurveString } from './curveString';
import { BinaryCryptoKeyLengths } from '../../configs/constants';

type SignArgs = {
  message: Uint8Array;
  privateKey: PrivateKey;
};

const signByEd25519Key = (message: Uint8Array, u8PrivateKey: Uint8Array) => {
  const u8SecretKey = u8PrivateKey.slice(0, BinaryCryptoKeyLengths.Ed25519.SecretKey);
  const u8Signature = ed25519.sign(message, u8SecretKey);

  return {
    signature: toCurveString('ed25519', u8Signature),
    u8Signature,
  };
};

const signBySecp256k1Key = (message: Uint8Array, u8PrivateKey: Uint8Array) => {
  // Create getSecretKey
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
    signature: toCurveString('secp256k1', u8Signature),
    u8Signature,
  };
};

// TODO maybe use Hex instead of Uint8Array for message
export const sign = ({ message, privateKey }: SignArgs) => {
  // PrivateKeySchema.parse(privateKey);
  const { curve, u8Data: u8PrivateKey } = fromCurveString(privateKey);
  if (curve === 'secp256k1') return signBySecp256k1Key(message, u8PrivateKey);
  return signByEd25519Key(message, u8PrivateKey);
};
