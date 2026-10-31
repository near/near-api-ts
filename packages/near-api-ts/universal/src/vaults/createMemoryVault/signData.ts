import * as z from 'zod/mini';
import type { MemoryVaultContext } from '../../../types/memoryVault/memoryVault';
import type { SafeSignData } from '../../../types/memoryVault/signData';
import { result, resultNatError } from '../../_common/_common/_common/result';
import { wrapInternalError } from '../../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../../_common/zodSchemas/publicKey';

const SignDataArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  dataU8: z.instanceof(Uint8Array),
});

export const createSafeSignData = (context: MemoryVaultContext): SafeSignData =>
  wrapInternalError('MemoryVault.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryVault.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey, dataU8 } = validArgs.data;

    // Check if key exists in the storage;
    const keyPair = context.keyPairs[publicKey.publicKey];

    if (!keyPair)
      return resultNatError('MemoryVault.SignData.SigningKey.NotFound', {
        publicKey: publicKey.publicKey,
      });

    // Sign data;
    const signedData = await keyPair.signData({ dataU8 });

    return result.ok(signedData);
  });
