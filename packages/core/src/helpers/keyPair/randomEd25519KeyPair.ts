import { ed25519 } from '@noble/curves/ed25519';
import { toEd25519CurveString } from '@common/transformers/curveString';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type { Hex } from 'nat-types/_common/common';
import type {
  CreateRandomEd25519KeyPair,
  SafeCreateRandomEd25519KeyPair,
} from 'nat-types/_common/keyPair/randomEd25519KeyPair';
import { signByEd25519Key } from './_common/signByEd25519Key';

const createSafeSignByEd25519Key = (u8PrivateKey: Uint8Array) =>
  wrapUnknownError('Ed25519KeyPair.Sign.Unknown', (message: Hex) =>
    signByEd25519Key(u8PrivateKey, message),
  );

export const safeCreateRandomEd25519KeyPair: SafeCreateRandomEd25519KeyPair =
  wrapUnknownError('CreateRandomEd25519KeyPair.Unknown', () => {
    const { secretKey: u8SecretKey, publicKey: u8PublicKey } = ed25519.keygen();

    const u8PrivateKey = new Uint8Array([...u8SecretKey, ...u8PublicKey]);
    const publicKey = toEd25519CurveString(u8PublicKey);
    const privateKey = toEd25519CurveString(u8PrivateKey);
    const safeSign = createSafeSignByEd25519Key(u8PrivateKey);

    return result.ok({
      publicKey,
      privateKey,
      sign: asThrowable(safeSign),
      safeSign,
    });
  });

export const throwableCreateRandomEd25519KeyPair: CreateRandomEd25519KeyPair =
  asThrowable(safeCreateRandomEd25519KeyPair);
