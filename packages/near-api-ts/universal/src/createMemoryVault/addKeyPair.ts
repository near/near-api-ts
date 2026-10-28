import * as z from 'zod/mini';
import type { SafeAddKeyPair } from '../../types/memoryVault/addKeyPair';
import type { MemoryVaultContext } from '../../types/memoryVault/memoryVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PrivateKeyZodSchema } from './_common/_common/zodSchemas/privateKey';
import { keyPair } from './_common/keyPairs/keyPair/keyPair';

const AddKeyPairArgsZodSchema = z.object({
  privateKey: PrivateKeyZodSchema,
});

export const createSafeAddKeyPair = (context: MemoryVaultContext): SafeAddKeyPair =>
  wrapInternalError('MemoryVault.AddKeyPair.Internal', async (args) => {
    const validArgs = AddKeyPairArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.AddKeyPair.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    // A key pair the vault already holds is replaced by the very same key pair
    const kp = keyPair(validArgs.data.privateKey.privateKey);
    context.keyPairs[kp.publicKey] = kp;

    return result.ok({ publicKey: kp.publicKey, publicKeyId: kp.publicKeyId });
  });
