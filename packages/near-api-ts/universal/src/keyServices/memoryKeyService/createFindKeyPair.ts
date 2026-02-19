import * as z from 'zod/mini';
import type { SafeFindKeyPair } from '../../../types/keyServices/memoryKeyService/createFindKeyPair';
import type { MemoryKeyServiceContext } from '../../../types/keyServices/memoryKeyService/memoryKeyService';
import { createNatError } from '../../_common/natError';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';

const FindKeyPairArgsSchema = z.object({
  publicKey: PublicKeySchema,
});

export const createSafeFindKeyPair = (
  context: MemoryKeyServiceContext,
): SafeFindKeyPair =>
  wrapInternalError('MemoryKeyService.FindKeyPair.Internal', (args) => {
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
