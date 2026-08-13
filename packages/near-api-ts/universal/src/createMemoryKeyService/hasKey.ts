import * as z from 'zod/mini';
import type { SafeHasKey } from '../../types/memoryKeyService/hasKey';
import type { MemoryKeyServiceContext } from '../../types/memoryKeyService/memoryKeyService';
import { result, resultNatError } from '../_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';

const HasKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
});

export const createSafeHasKey = (context: MemoryKeyServiceContext): SafeHasKey =>
  wrapInternalError('MemoryKeyService.HasKey.Internal', async (args) => {
    const validArgs = HasKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyService.HasKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey } = validArgs.data.publicKey;
    const keyPair = context.keyPairs[publicKey];

    return result.ok(keyPair !== undefined);
  });
