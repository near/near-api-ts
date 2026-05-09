import * as z from 'zod/mini';
import type { SafeHasKey } from '../../../../types/keyServices/memoryKeyService/hasKey';
import type { MemoryKeyServiceContext } from '../../../../types/keyServices/memoryKeyService/memoryKeyService';
import { resultNatError } from '../../../_common/natError';
import { PublicKeyZodSchema } from '../../../_common/schemas/zod/common/publicKey';
import { result } from '../../../_common/utils/result';
import { wrapInternalError } from '../../../_common/utils/wrapInternalError';

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
