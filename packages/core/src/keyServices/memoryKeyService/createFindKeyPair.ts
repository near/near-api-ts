import * as z from 'zod/mini';
import { result } from '@common/utils/result';
import { wrapUnknownError } from '@common/utils/wrapUnknownError';
import type { MemoryKeyServiceContext } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { createNatError } from '@common/natError';
import type { SafeFindKeyPair } from 'nat-types/keyServices/memoryKeyService/createFindKeyPair';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';

const FindKeyPairArgsSchema = z.object({
  publicKey: PublicKeySchema,
});

export const createSafeFindKeyPair = (
  context: MemoryKeyServiceContext,
): SafeFindKeyPair =>
  wrapUnknownError('MemoryKeyService.FindKeyPair.Unknown', (args) => {
    const validArgs = FindKeyPairArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'MemoryKeyService.FindKeyPair.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const { publicKey } = validArgs.data.publicKey;
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
