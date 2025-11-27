import { signByEd25519Key } from './_common/signByEd25519Key';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';
import { result } from '@common/utils/result';
import {
  fromCurveString,
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { asThrowable } from '@common/utils/asThrowable';
import type {
  PrivateKey,
  PublicKey,
  U8PrivateKey,
} from 'nat-types/_common/crypto';
import type {
  CreateKeyPair,
  SafeCreateKeyPair,
  SafeSign,
} from 'nat-types/_common/keyPair/keyPair';
import { createNatError, type NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';
import { CurveStringSchema } from '@common/schemas/zod/common';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getPublicKey = ({ curve, u8PrivateKey }: U8PrivateKey): PublicKey =>
  curve === 'ed25519'
    ? toEd25519CurveString(u8PrivateKey.slice(Ed25519.SecretKey))
    : toSecp256k1CurveString(u8PrivateKey.slice(Secp256k1.SecretKey));

const getU8PrivateKey = (
  privateKey: PrivateKey,
): Result<
  U8PrivateKey,
  | NatError<'CreateKeyPair.PrivateKey.InvalidCurveString'>
  | NatError<'CreateKeyPair.PrivateKey.InvalidBinaryLength'>
> => {
  const validatedCurveString = CurveStringSchema.safeParse(privateKey);

  if (!validatedCurveString.success)
    return result.err(
      createNatError({
        kind: 'CreateKeyPair.PrivateKey.InvalidCurveString',
        context: { zodError: validatedCurveString.error },
      }),
    );

  const { curve, u8Data } = fromCurveString(privateKey);

  if (
    (curve === 'ed25519' && u8Data.length === Ed25519.PrivateKey) ||
    (curve === 'secp256k1' && u8Data.length === Secp256k1.PrivateKey)
  )
    return result.ok({ curve, u8PrivateKey: u8Data });

  return result.err(
    createNatError({
      kind: 'CreateKeyPair.PrivateKey.InvalidBinaryLength',
      context: {
        curve,
        actualLength: u8Data.length,
        expectedLength:
          curve === 'ed25519' ? Ed25519.PrivateKey : Secp256k1.PrivateKey,
      },
    }),
  );
};

const createSafeSign = ({ curve, u8PrivateKey }: U8PrivateKey): SafeSign =>
  wrapUnknownError('KeyPair.Sign.Unknown', (message) =>
    curve === 'ed25519'
      ? signByEd25519Key(u8PrivateKey, message)
      : signBySecp256k1Key(u8PrivateKey, message),
  );

export const safeKeyPair: SafeCreateKeyPair = wrapUnknownError(
  'CreateKeyPair.Unknown',
  (privateKey) => {
    const u8PrivateKey = getU8PrivateKey(privateKey);
    if (!u8PrivateKey.ok) return u8PrivateKey;

    const safeSign = createSafeSign(u8PrivateKey.value);

    return result.ok({
      publicKey: getPublicKey(u8PrivateKey.value), // TODO use Lazy getter, like NearToken
      privateKey,
      sign: asThrowable(safeSign),
      safe: {
        sign: safeSign,
      },
    });
  },
);

export const throwableKeyPair: CreateKeyPair = asThrowable(safeKeyPair);
