import type { SafeSignData } from '../../../../types/_common/keyPairs/keyPair';
import { BinaryLengths } from '../../../_common/configs/constants';
import { resultNatError } from '../../../_common/natError';
import { type InnerPrivateKey } from '../../../_common/schemas/zod/common/privateKey';
import { wrapInternalError } from '../../../_common/utils/wrapInternalError';
import { SignDataArgsZodSchema } from '../_common/_index';
import { signByEd25519Key } from '../_common/signByEd25519Key';
import { signByMlDsa65Key } from '../_common/signByMlDsa65Key';
import { signBySecp256k1Key } from '../_common/signBySecp256k1Key';

const getSecretKey = ({ curve, privateKeyU8 }: InnerPrivateKey) => {
  switch (curve) {
    case 'ed25519':
      return privateKeyU8.slice(0, BinaryLengths.Ed25519.SecretKey);
    case 'secp256k1':
      return privateKeyU8.slice(0, BinaryLengths.Secp256k1.SecretKey);
    // ml-dsa-65 stores secret-only, so the whole private key is the secret
    case 'ml-dsa-65':
      return privateKeyU8;
  }
};

export const createSafeSignData = (innerPrivateKey: InnerPrivateKey): SafeSignData => {
  const secretKeyU8 = getSecretKey(innerPrivateKey);

  return wrapInternalError('KeyPair.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('KeyPair.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    switch (innerPrivateKey.curve) {
      case 'ed25519':
        return signByEd25519Key(secretKeyU8, validArgs.data.dataU8);
      case 'secp256k1':
        return signBySecp256k1Key(secretKeyU8, validArgs.data.dataU8);
      case 'ml-dsa-65':
        return signByMlDsa65Key(secretKeyU8, validArgs.data.dataU8);
    }
  });
};
