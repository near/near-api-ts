import type {
  CreateKeyPair,
  SafeCreateKeyPair,
  SafeSign,
} from '../../../types/_common/keyPair/keyPair';
import { resultNatError } from '../../_common/natError';
import {
  type InnerPrivateKey,
  PrivateKeySchema,
} from '../../_common/schemas/zod/common/privateKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { signByEd25519Key } from './_common/signByEd25519Key';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';
import { getInnerPublicKey } from '@universal/src/helpers/keyPair/getInnerPublicKey';

const createSafeSign = ({ curve, u8PrivateKey }: InnerPrivateKey): SafeSign =>
  wrapInternalError('KeyPair.Sign.Internal', (message) =>
    curve === 'ed25519'
      ? signByEd25519Key(u8PrivateKey, message)
      : signBySecp256k1Key(u8PrivateKey, message),
  );

export const safeKeyPair: SafeCreateKeyPair = wrapInternalError(
  'CreateKeyPair.Internal',
  (privateKey) => {
    const validPrivateKey = PrivateKeySchema.safeParse(privateKey);

    if (!validPrivateKey.success)
      return resultNatError('CreateKeyPair.Args.InvalidSchema', {
        zodError: validPrivateKey.error,
      });

    // TODO maybe use Lazy getter, like NearToken
    const innerPublicKey = getInnerPublicKey(validPrivateKey.data);

    const safeSign = createSafeSign(validPrivateKey.data);

    return result.ok({
      publicKey: innerPublicKey.publicKey,
      privateKey: validPrivateKey.data.privateKey,
      sign: asThrowable(safeSign),
      safeSign,
    });
  },
);

export const throwableKeyPair: CreateKeyPair = asThrowable(safeKeyPair);
