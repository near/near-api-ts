import { ml_dsa65 } from '@noble/post-quantum/ml-dsa.js';
import type {
  CreateRandomMlDsa65KeyPair,
  SafeCreateRandomMlDsa65KeyPair,
  SafeSignData,
} from '../../../types/_common/keyPairs/randomMlDsa65KeyPair';
import { resultNatError } from '../../_common/natError';
import { toMlDsa65CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { SignDataArgsZodSchema } from './_common/_index';
import { signByMlDsa65Key } from './_common/signByMlDsa65Key';

const createSafeSignData = (privateKeyU8: Uint8Array): SafeSignData => {
  // Storage is secret-only (4032 B): the whole private key IS the secret,
  // so there is no secret/public split to slice.
  const secretKeyU8 = privateKeyU8;

  return wrapInternalError('MlDsa65KeyPair.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MlDsa65KeyPair.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return signByMlDsa65Key(secretKeyU8, validArgs.data.dataU8);
  });
};

export const safeRandomMlDsa65KeyPair: SafeCreateRandomMlDsa65KeyPair = wrapInternalError(
  'CreateRandomMlDsa65KeyPair.Internal',
  () => {
    // Storage is secret-only (4032 B). The public key is derived, never
    // concatenated into the private key.
    const { secretKey: secretKeyU8, publicKey: publicKeyU8 } = ml_dsa65.keygen();

    const privateKeyU8 = secretKeyU8;

    const publicKey = toMlDsa65CurveString(publicKeyU8);
    const privateKey = toMlDsa65CurveString(privateKeyU8);

    const safeSignData = createSafeSignData(privateKeyU8);

    return result.ok({
      curve: 'ml-dsa-65' as const,
      publicKey,
      publicKeyU8,
      privateKey,
      privateKeyU8,
      signData: asThrowable(safeSignData),
      safeSignData,
    });
  },
);

export const randomMlDsa65KeyPair: CreateRandomMlDsa65KeyPair =
  asThrowable(safeRandomMlDsa65KeyPair);
