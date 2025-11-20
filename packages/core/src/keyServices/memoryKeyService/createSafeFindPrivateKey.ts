import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type {
  Context,
  SafeFindPrivateKey,
} from 'nat-types/keyServices/memoryKeyService';

export const createSafeFindPrivateKey = (
  context: Context,
): SafeFindPrivateKey =>
  wrapUnknownError((args) => {
    // TODO add validations
    const { publicKey } = args;
    const privateKey = context.keyPairs[publicKey];

    return context.keyPairs[publicKey]
      ? result.ok(privateKey)
      : result.err(
          new Error(
            `Cannot find a corresponding private key for '${publicKey}'`, // TODO Fix error type
          ),
        );
  });
