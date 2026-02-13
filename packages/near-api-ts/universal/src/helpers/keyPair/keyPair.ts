import { signByEd25519Key } from './_common/signByEd25519Key';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';
import { result } from '../../_common/utils/result';
import {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '../../_common/transformers/toCurveString';
import { BinaryLengths } from '../../_common/configs/constants';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { asThrowable } from '../../_common/utils/asThrowable';
import type { PublicKey } from '../../../types/_common/crypto';
import type {
  CreateKeyPair,
  SafeCreateKeyPair,
  SafeSign,
} from '../../../types/_common/keyPair/keyPair';
import { createNatError } from '../../_common/natError';
import {
  type InnerPrivateKey,
  PrivateKeySchema,
} from '../../_common/schemas/zod/common/privateKey';

const { Ed25519, Secp256k1 } = BinaryLengths;

const getPublicKey = ({ curve, u8PrivateKey }: InnerPrivateKey): PublicKey =>
  curve === 'ed25519'
    ? toEd25519CurveString(u8PrivateKey.slice(Ed25519.SecretKey))
    : toSecp256k1CurveString(u8PrivateKey.slice(Secp256k1.SecretKey));

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
      return result.err(
        createNatError({
          kind: 'CreateKeyPair.Args.InvalidSchema',
          context: { zodError: validPrivateKey.error },
        }),
      );

    const safeSign = createSafeSign(validPrivateKey.data);

    return result.ok({
      publicKey: getPublicKey(validPrivateKey.data), // TODO use Lazy getter, like NearToken
      privateKey: validPrivateKey.data.privateKey,
      sign: asThrowable(safeSign),
      safeSign,
    });
  },
);

export const throwableKeyPair: CreateKeyPair = asThrowable(safeKeyPair);
