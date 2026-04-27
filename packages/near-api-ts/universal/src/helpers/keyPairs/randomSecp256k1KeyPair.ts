import { getPublicKey, utils } from '@noble/secp256k1';
import type {
  CreateRandomSecp256k1KeyPair,
  SafeCreateRandomSecp256k1KeyPair,
  SafeSignData,
} from '../../../types/_common/keyPairs/randomSecp256k1KeyPair';
import { BinaryLengths } from '../../_common/configs/constants';
import { resultNatError } from '../../_common/natError';
import { toSecp256k1CurveString } from '../../_common/transformers/toCurveString';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { SignDataArgsZodSchema } from './_common/_index';
import { signBySecp256k1Key } from './_common/signBySecp256k1Key';

const createSafeSignData = (privateKeyU8: Uint8Array): SafeSignData => {
  const secretKeyU8 = privateKeyU8.slice(0, BinaryLengths.Secp256k1.SecretKey);

  return wrapInternalError('Secp256k1KeyPair.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('Secp256k1KeyPair.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return signBySecp256k1Key(secretKeyU8, validArgs.data.dataU8);
  });
};

export const safeRandomSecp256k1KeyPair: SafeCreateRandomSecp256k1KeyPair = wrapInternalError(
  'CreateRandomSecp256k1KeyPair.Internal',
  () => {
    const secretKeyU8 = utils.randomSecretKey();
    // nearcore expects an uncompressed public key without header 0x04
    const publicKeyU8 = getPublicKey(secretKeyU8, false);
    const publicKeyWithoutHeaderU8 = publicKeyU8.slice(1);

    const privateKeyU8 = new Uint8Array([...secretKeyU8, ...publicKeyWithoutHeaderU8]);

    const publicKey = toSecp256k1CurveString(publicKeyWithoutHeaderU8);
    const privateKey = toSecp256k1CurveString(privateKeyU8);

    const safeSignData = createSafeSignData(privateKeyU8);

    return result.ok({
      curve: 'secp256k1' as const,
      publicKey,
      publicKeyU8,
      privateKey,
      privateKeyU8,
      signData: asThrowable(safeSignData),
      safeSignData,
    });
  },
);

export const randomSecp256k1KeyPair: CreateRandomSecp256k1KeyPair = asThrowable(
  safeRandomSecp256k1KeyPair,
);
