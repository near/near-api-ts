import { secp256k1 } from '@noble/curves/secp256k1';
import { toSecp256k1CurveString } from '../../_common/transformers/toCurveString';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import type {
  CreateRandomSecp256k1KeyPair,
  SafeCreateRandomSecp256k1KeyPair,
} from '../../../types/_common/keyPair/randomSecp256k1KeyPair';
import type { Hex } from '../../../types/_common/common';

const createSafeSignBySecp256k1Key = (u8PrivateKey: Uint8Array) =>
  wrapInternalError('Secp256k1KeyPair.Sign.Internal', (message: Hex) =>
    signBySecp256k1Key(u8PrivateKey, message),
  );

export const safeRandomSecp256k1KeyPair: SafeCreateRandomSecp256k1KeyPair =
  wrapInternalError('CreateRandomSecp256k1KeyPair.Internal', () => {
    const u8SecretKey = secp256k1.utils.randomSecretKey();
    // nearcore expects an uncompressed public key without header 0x04
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
      safeSign,
    });
  });

export const throwableRandomSecp256k1KeyPair: CreateRandomSecp256k1KeyPair =
  asThrowable(safeRandomSecp256k1KeyPair);
