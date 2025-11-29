import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type { MemoryKeyServiceContext } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { createNatError } from '@common/natError';
import type { SafeFindKeyPair } from 'nat-types/keyServices/memoryKeyService/createFindKeyPair';

export const createSafeFindKeyPair = (
  context: MemoryKeyServiceContext,
): SafeFindKeyPair =>
  wrapUnknownError('MemoryKeyService.FindKeyPair.Unknown', (args) => {
    // TODO add validations

    const { publicKey } = args;
    const keyPair = context.keyPairs[publicKey];

    return context.keyPairs[publicKey]
      ? result.ok(keyPair)
      : result.err(
          createNatError({
            kind: 'MemoryKeyService.FindKeyPair.NotFound',
            context: { publicKey },
          }),
        );
  });
