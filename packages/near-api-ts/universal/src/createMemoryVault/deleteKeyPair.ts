import * as z from 'zod/mini';
import type { SafeDeleteKeyPair } from '../../types/memoryVault/deleteKeyPair';
import type { MemoryVaultContext } from '../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';
import { PublicKeyIdZodSchema } from '../_common/zodSchemas/publicKeyId';

const DeleteKeyPairArgsZodSchema = z.union([
  z.object({
    publicKey: PublicKeyZodSchema,
  }),
  z.object({
    publicKeyId: PublicKeyIdZodSchema,
  }),
]);

export const createSafeDeleteKeyPair = (context: MemoryVaultContext): SafeDeleteKeyPair =>
  wrapInternalError('MemoryVault.DeleteKeyPair.Internal', async (args) => {
    const validArgs = DeleteKeyPairArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.DeleteKeyPair.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    if ('publicKey' in validArgs.data) {
      delete context.keyPairs[validArgs.data.publicKey.publicKey];
      return result.ok(undefined);
    }

    const { publicKeyId } = validArgs.data;

    const keyPair = Object.values(context.keyPairs).find(
      (keyPair) => keyPair.publicKeyId === publicKeyId,
    );

    if (keyPair) delete context.keyPairs[keyPair.publicKey];

    return result.ok(undefined);
  });
