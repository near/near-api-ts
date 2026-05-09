import * as z from 'zod/mini';
import type { MemoryKeyServiceContext } from '../../../../types/keyServices/memoryKeyService/memoryKeyService';
import type { SafeSignData } from '../../../../types/keyServices/memoryKeyService/signData';
import { resultNatError } from '../../../_common/natError';
import { PublicKeyZodSchema } from '../../../_common/schemas/zod/common/publicKey';
import { result } from '../../../_common/utils/result';
import { wrapInternalError } from '../../../_common/utils/wrapInternalError';

const SignDataArgsZodSchema = z.object({
  publicKey: PublicKeyZodSchema,
  dataU8: z.instanceof(Uint8Array),
});

export const createSafeSignData = (context: MemoryKeyServiceContext): SafeSignData =>
  wrapInternalError('MemoryKeyService.SignData.Internal', async (args) => {
    const validArgs = SignDataArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyService.SignData.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const { publicKey, dataU8 } = validArgs.data;

    // Check if key exists in the storage;
    const isKeyPair = await context.hasKey({ publicKey: publicKey.publicKey });

    if (!isKeyPair)
      return resultNatError('MemoryKeyService.SignData.SigningKey.NotFound', {
        publicKey: publicKey.publicKey,
      });

    // Sign data;
    const keyPair = context.keyPairs[publicKey.publicKey];
    const signedData = await keyPair.signData({ dataU8 });

    return result.ok(signedData);
  });
