import { ed25519 } from '@noble/curves/ed25519';
import type { Hex } from '../../../types/_common/common';
import type { CreateRandomEd25519KeyPair, SafeCreateRandomEd25519KeyPair } from '../../../types/_common/keyPair/randomEd25519KeyPair';
import { toEd25519CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { signByEd25519Key } from './_common/signByEd25519Key';

const createSafeSignByEd25519Key = (u8PrivateKey: Uint8Array) =>
  wrapInternalError('Ed25519KeyPair.Sign.Internal', (message: Hex) =>
    signByEd25519Key(u8PrivateKey, message),
  );

export const safeRandomEd25519KeyPair: SafeCreateRandomEd25519KeyPair =
  wrapInternalError('CreateRandomEd25519KeyPair.Internal', () => {
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

export const throwableRandomEd25519KeyPair: CreateRandomEd25519KeyPair =
  asThrowable(safeRandomEd25519KeyPair);
