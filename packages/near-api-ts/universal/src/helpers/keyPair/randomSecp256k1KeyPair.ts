import { secp256k1 } from '@noble/curves/secp256k1';
import type {
  CreateRandomSecp256k1KeyPair,
  SafeCreateRandomSecp256k1KeyPair,
} from '../../../types/_common/keyPair/randomSecp256k1KeyPair';
import { toSecp256k1CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';

const createSafeSignBySecp256k1Key = (u8PrivateKey: Uint8Array) =>
  wrapInternalError('Secp256k1KeyPair.Sign.Internal', (u8Message: Uint8Array) =>
    signBySecp256k1Key(u8PrivateKey, u8Message),
  );

export const safeRandomSecp256k1KeyPair: SafeCreateRandomSecp256k1KeyPair = wrapInternalError(
  'CreateRandomSecp256k1KeyPair.Internal',
  () => {
    const secretKeyU8 = secp256k1.utils.randomSecretKey();
    // nearcore expects an uncompressed public key without header 0x04
    const publicKeyU8 = secp256k1.getPublicKey(secretKeyU8, false);
    const publicKeyWithoutHeaderU8 = publicKeyU8.slice(1);

    const privateKeyU8 = new Uint8Array([...secretKeyU8, ...publicKeyWithoutHeaderU8]);

    const publicKey = toSecp256k1CurveString(publicKeyWithoutHeaderU8);
    const privateKey = toSecp256k1CurveString(privateKeyU8);

    const safeSign = createSafeSignBySecp256k1Key(privateKeyU8);

    return result.ok({
      curve: 'secp256k1' as const,
      publicKey,
      publicKeyU8,
      privateKey,
      privateKeyU8,
      sign: asThrowable(safeSign),
      safeSign,
    });
  },
);

export const randomSecp256k1KeyPair: CreateRandomSecp256k1KeyPair = asThrowable(
  safeRandomSecp256k1KeyPair,
);
