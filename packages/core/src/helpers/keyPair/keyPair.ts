import { createSafeSign } from './_common/createSafeSign';
import { safeFromCurveString } from '@common/transformers/curveString/fromCurveString';
import { result } from '@common/utils/result';
import {
  toEd25519CurveString,
  toSecp256k1CurveString,
} from '@common/transformers/curveString/toCurveString';
import { BinaryCryptoKeyLengths } from '@common/configs/constants';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import { asThrowable } from '@common/utils/asThrowable';
import type {
  Curve,
  FromCurveStringOutput,
} from 'nat-types/_common/curveString';
import type { PublicKey, U8PrivateKey } from 'nat-types/_common/crypto';
import type {
  CreateKeyPair,
  SafeCreateKeyPair,
} from 'nat-types/_common/keyPair';
import { createNatError, NatError } from '@common/natError';
import type { Result } from 'nat-types/_common/common';

const { Ed25519, Secp256k1 } = BinaryCryptoKeyLengths;

const getPublicKey = ({ curve, u8PrivateKey }: U8PrivateKey): PublicKey =>
  curve === 'ed25519'
    ? toEd25519CurveString(u8PrivateKey.slice(Ed25519.SecretKey))
    : toSecp256k1CurveString(u8PrivateKey.slice(Secp256k1.SecretKey));

const validatePrivateKeyBinaryLength = (
  args: FromCurveStringOutput,
): Result<
  U8PrivateKey,
  NatError<'CreateKeyPair.PrivateKey.InvalidBinaryLength'>
> => {
  const { curve, u8Data } = args;

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

export const safeKeyPair: SafeCreateKeyPair = wrapUnknownError(
  'CreateKeyPair.Unknown',
  (privateKey) => {
    const parsedCurveString = safeFromCurveString(privateKey);

    if (!parsedCurveString.ok)
      return result.err(
        createNatError({
          kind: 'CreateKeyPair.PrivateKey.InvalidStringFormat',
          context: { zodError: parsedCurveString.error.context.zodError },
        }),
      );

    const u8PrivateKey = validatePrivateKeyBinaryLength(
      parsedCurveString.value,
    );
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

export const keyPair: CreateKeyPair = asThrowable(safeKeyPair);
