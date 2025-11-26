import { secp256k1 } from '@noble/curves/secp256k1';
import { toSecp256k1CurveString } from '@common/transformers/curveString/toCurveString';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type {
  CreateRandomSecp256k1KeyPair,
  SafeCreateRandomSecp256k1KeyPair,
} from 'nat-types/_common/keyPair/randomKeyPair';
import type { Hex } from 'nat-types/_common/common';

const createSafeSignBySecp256k1Key = (u8PrivateKey: Uint8Array) =>
  wrapUnknownError('RandomSecp256k1KeyPair.Sign.Unknown', (message: Hex) =>
    signBySecp256k1Key(u8PrivateKey, message),
  );

export const safeRandomSecp256k1KeyPair: SafeCreateRandomSecp256k1KeyPair =
  wrapUnknownError('CreateRandomSecp256k1KeyPair.Unknown', () => {
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

    const safeSign = createSafeSignBySecp256k1Key(u8PrivateKey);

    return result.ok({
      publicKey,
      privateKey,
      sign: asThrowable(safeSign),
      safe: {
        sign: safeSign,
      },
    });
  });

export const randomSecp256k1KeyPair: CreateRandomSecp256k1KeyPair = asThrowable(
  safeRandomSecp256k1KeyPair,
);
