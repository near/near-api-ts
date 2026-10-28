import * as z from 'zod/mini';
import type { SafeFindPublicKey } from '../../types/memoryVault/findPublicKey';
import type { MemoryVaultContext } from '../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyIdZodSchema } from '../_common/zodSchemas/publicKeyId';

const FindPublicKeyArgsZodSchema = z.object({
  publicKeyId: PublicKeyIdZodSchema,
});

export const createSafeFindPublicKey = (context: MemoryVaultContext): SafeFindPublicKey =>
  wrapInternalError('MemoryVault.FindPublicKey.Internal', async (args) => {
    const validArgs = FindPublicKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.FindPublicKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const keyPair = Object.values(context.keyPairs).find(
      ({ publicKeyId }) => publicKeyId === validArgs.data.publicKeyId,
    );

    return result.ok(keyPair?.publicKey);
  });
