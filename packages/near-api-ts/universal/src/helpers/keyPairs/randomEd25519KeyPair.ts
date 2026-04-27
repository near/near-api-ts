import { keygen } from '@noble/ed25519';
import type {
  CreateRandomEd25519KeyPair,
  SafeCreateRandomEd25519KeyPair,
  SafeSignData,
} from '../../../types/_common/keyPairs/randomEd25519KeyPair';
import { BinaryLengths } from '../../_common/configs/constants';
import { resultNatError } from '../../_common/natError';
import { toEd25519CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { SignDataArgsZodSchema } from './_common/_index';
import { signByEd25519Key } from './_common/signByEd25519Key';

const createSafeSignData = (privateKeyU8: Uint8Array): SafeSignData => {
  const secretKeyU8 = privateKeyU8.slice(0, BinaryLengths.Ed25519.SecretKey);

  return wrapInternalError('Ed25519KeyPair.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Ed25519KeyPair.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return signByEd25519Key(secretKeyU8, validArgs.data.dataU8);
  });
};

export const safeRandomEd25519KeyPair: SafeCreateRandomEd25519KeyPair = wrapInternalError(
  'CreateRandomEd25519KeyPair.Internal',
  () => {
    const { secretKey: secretKeyU8, publicKey: publicKeyU8 } = keygen();

    const privateKeyU8 = new Uint8Array([...secretKeyU8, ...publicKeyU8]);
    const publicKey = toEd25519CurveString(publicKeyU8);
    const privateKey = toEd25519CurveString(privateKeyU8);

    const safeSignData = createSafeSignData(privateKeyU8);

    return result.ok({
      curve: 'ed25519' as const,
      publicKey,
      publicKeyU8,
      privateKey,
      privateKeyU8,
      signData: asThrowable(safeSignData),
      safeSignData,
    });
  },
);

export const randomEd25519KeyPair: CreateRandomEd25519KeyPair =
  asThrowable(safeRandomEd25519KeyPair);
