import type { SafeSignData } from '../../../../types/_common/keyPairs/keyPair';
import { BinaryLengths } from '../../../_common/configs/constants';
import { resultNatError } from '../../../_common/natError';
import { type InnerPrivateKey } from '../../../_common/schemas/zod/common/privateKey';
import { wrapInternalError } from '../../../_common/utils/wrapInternalError';
import { SignDataArgsZodSchema } from '../_common/_index';
import { signByEd25519Key } from '../_common/signByEd25519Key';
import { signBySecp256k1Key } from '../_common/signBySecp256k1Key';

const getSecretKey = ({ curve, u8PrivateKey }: InnerPrivateKey) => {
  const secretKeyLength =
    curve === 'ed25519' ? BinaryLengths.Ed25519.SecretKey : BinaryLengths.Secp256k1.SecretKey;
  return u8PrivateKey.slice(0, secretKeyLength);
};

export const createSafeSignData = (innerPrivateKey: InnerPrivateKey): SafeSignData => {
  const secretKeyU8 = getSecretKey(innerPrivateKey);

  return wrapInternalError('KeyPair.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('KeyPair.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    return innerPrivateKey.curve === 'ed25519'
      ? signByEd25519Key(secretKeyU8, validArgs.data.dataU8)
      : signBySecp256k1Key(secretKeyU8, validArgs.data.dataU8);
  });
};
