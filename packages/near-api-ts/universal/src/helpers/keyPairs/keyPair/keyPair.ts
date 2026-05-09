import type { CreateKeyPair, SafeCreateKeyPair } from '../../../../types/_common/keyPairs/keyPair';
import { resultNatError } from '../../../_common/natError';
import { PrivateKeyZodSchema } from '../../../_common/schemas/zod/common/privateKey';
import { asThrowable } from '../../../_common/utils/asThrowable';
import { result } from '../../../_common/utils/result';
import { wrapInternalError } from '../../../_common/utils/wrapInternalError';
import { getInnerPublicKey } from './getInnerPublicKey';
import { createSafeSignData } from './signData';

export const safeKeyPair: SafeCreateKeyPair = wrapInternalError(
  'CreateKeyPair.Internal',
  (privateKey) => {
    const validPrivateKey = PrivateKeyZodSchema.safeParse(privateKey);

    if (!validPrivateKey.success)
      return resultNatError('CreateKeyPair.Args.InvalidSchema', {
        zodError: validPrivateKey.error,
      });

    const innerPublicKey = getInnerPublicKey(validPrivateKey.data);
    const safeSignData = createSafeSignData(validPrivateKey.data);

    return result.ok({
      curve: innerPublicKey.curve,
      publicKey: innerPublicKey.publicKey,
      publicKeyU8: innerPublicKey.publicKeyU8,
      privateKey: validPrivateKey.data.privateKey,
      privateKeyU8: validPrivateKey.data.u8PrivateKey,
      signData: asThrowable(safeSignData),
      safeSignData,
    });
  },
);

export const keyPair: CreateKeyPair = asThrowable(safeKeyPair);
