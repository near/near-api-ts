import * as z from 'zod/mini';
import type { SafeGetPublicKey } from '../../../types/memoryVault/getPublicKey';
import type { MemoryVaultContext } from '../../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyIdZodSchema } from '../../_common/zodSchemas/publicKeyId';

const GetPublicKeyArgsZodSchema = z.object({
  publicKeyId: PublicKeyIdZodSchema,
});

export const createSafeGetPublicKey = (context: MemoryVaultContext): SafeGetPublicKey =>
  wrapInternalError('MemoryVault.GetPublicKey.Internal', async (args) => {
    const validArgs = GetPublicKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.GetPublicKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKeyId } = validArgs.data;

    const keyPair = Object.values(context.keyPairs).find(
      (keyPair) => keyPair.publicKeyId === publicKeyId,
    );

    if (!keyPair)
      return resultNatError('MemoryVault.GetPublicKey.PublicKey.NotFound', { publicKeyId });

    return result.ok(keyPair.publicKey);
  });
