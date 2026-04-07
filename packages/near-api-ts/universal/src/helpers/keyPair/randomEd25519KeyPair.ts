import { ed25519 } from '@noble/curves/ed25519';
import type {
  CreateRandomEd25519KeyPair,
  SafeCreateRandomEd25519KeyPair,
} from '../../../types/_common/keyPair/randomEd25519KeyPair';
import { toEd25519CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { signByEd25519Key } from './_common/signByEd25519Key';

const createSafeSignByEd25519Key = (u8PrivateKey: Uint8Array) =>
  wrapInternalError('Ed25519KeyPair.Sign.Internal', (u8Message: Uint8Array) =>
    signByEd25519Key(u8PrivateKey, u8Message),
  );

export const safeRandomEd25519KeyPair: SafeCreateRandomEd25519KeyPair = wrapInternalError(
  'CreateRandomEd25519KeyPair.Internal',
  () => {
    const { secretKey: secretKeyU8, publicKey: publicKeyU8 } = ed25519.keygen();

    const privateKeyU8 = new Uint8Array([...secretKeyU8, ...publicKeyU8]);
    const publicKey = toEd25519CurveString(publicKeyU8);
    const privateKey = toEd25519CurveString(privateKeyU8);
    const safeSign = createSafeSignByEd25519Key(privateKeyU8);

    return result.ok({
      curve: 'ed25519' as const,
      publicKey,
      publicKeyU8,
      privateKey,
      privateKeyU8,
      sign: asThrowable(safeSign),
      safeSign,
    });
  },
);

export const randomEd25519KeyPair: CreateRandomEd25519KeyPair =
  asThrowable(safeRandomEd25519KeyPair);
