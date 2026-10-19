import * as z from 'zod/mini';
import type { MemoryKeyVaultContext } from '../../types/memoryKeyVault/memoryKeyVault';
import type { SafeSignData } from '../../types/memoryKeyVault/signData';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';

const SignDataArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  dataU8: z.instanceof(Uint8Array),
});

export const createSafeSignData = (context: MemoryKeyVaultContext): SafeSignData =>
  wrapInternalError('MemoryKeyVault.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyVault.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey, dataU8 } = validArgs.data;

    // Check if key exists in the storage;
    const isKeyPair = await context.hasKey({ publicKey: publicKey.publicKey });

    if (!isKeyPair)
      return resultNatError('MemoryKeyVault.SignData.SigningKey.NotFound', {
        publicKey: publicKey.publicKey,
      });

    // Sign data;
    const keyPair = context.keyPairs[publicKey.publicKey];
    const signedData = await keyPair.signData({ dataU8 });

    return result.ok(signedData);
  });
