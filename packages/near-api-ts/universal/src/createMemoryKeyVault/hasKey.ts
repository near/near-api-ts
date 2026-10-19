import * as z from 'zod/mini';
import type { SafeHasKey } from '../../types/memoryKeyVault/hasKey';
import type { MemoryKeyVaultContext } from '../../types/memoryKeyVault/memoryKeyVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';

const HasKeyArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
});

export const createSafeHasKey = (context: MemoryKeyVaultContext): SafeHasKey =>
  wrapInternalError('MemoryKeyVault.HasKey.Internal', async (args) => {
    const validArgs = HasKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyVault.HasKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey } = validArgs.data.publicKey;
    const keyPair = context.keyPairs[publicKey];

    return result.ok(keyPair !== undefined);
  });
