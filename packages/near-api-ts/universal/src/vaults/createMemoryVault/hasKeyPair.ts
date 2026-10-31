import * as z from 'zod/mini';
import type { SafeHasKeyPair } from '../../../types/memoryVault/hasKeyPair';
import type { MemoryVaultContext } from '../../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';
import { PublicKeyIdZodSchema } from '../../_common/zodSchemas/publicKeyId';

const HasKeyPairArgsZodSchema = z.union([
  z.object({
    publicKey: PublicKeyZodSchema,
  }),
  z.object({
    publicKeyId: PublicKeyIdZodSchema,
  }),
]);

export const createSafeHasKeyPair = (context: MemoryVaultContext): SafeHasKeyPair =>
  wrapInternalError('MemoryVault.HasKeyPair.Internal', async (args) => {
    const validArgs = HasKeyPairArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.HasKeyPair.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    if ('publicKey' in validArgs.data) {
      const { publicKey } = validArgs.data.publicKey;
      return result.ok(context.keyPairs[publicKey] !== undefined);
    }

    const { publicKeyId } = validArgs.data;

    return result.ok(
      Object.values(context.keyPairs).some((keyPair) => keyPair.publicKeyId === publicKeyId),
    );
  });
