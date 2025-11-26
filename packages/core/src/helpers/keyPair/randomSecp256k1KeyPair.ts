import { secp256k1 } from '@noble/curves/secp256k1';
import { toSecp256k1CurveString } from '@common/transformers/curveString/toCurveString';
import { createSafeSign } from './_common/createSafeSign';
import type { KeyPair } from 'nat-types/_common/keyPair';
import { asThrowable } from '@common/utils/asThrowable';

// TODO add safe version
export const randomSecp256k1KeyPair = (): KeyPair => {
  const u8SecretKey = secp256k1.utils.randomSecretKey();
  // nearcore expects uncompressed public key without header 0x04
  const u8PublicKey = secp256k1.getPublicKey(u8SecretKey, false);
  const u8PublicKeyWithoutHeader = u8PublicKey.slice(1);

  const u8PrivateKey = new Uint8Array([
    ...u8SecretKey,
    ...u8PublicKeyWithoutHeader,
  ]);

  const publicKey = toSecp256k1CurveString(u8PublicKeyWithoutHeader);
  const privateKey = toSecp256k1CurveString(u8PrivateKey);
  const safeSign = createSafeSign({ curve: 'secp256k1', u8PrivateKey });

  return {
    publicKey,
    privateKey,
    sign: asThrowable(safeSign),
    safe: {
      sign: safeSign,
    },
  };
};
