import * as z from 'zod/mini';
import type { SafeFindPublicKey } from '../../types/memoryKeyService/findPublicKey';
import type { MemoryKeyServiceContext } from '../../types/memoryKeyService/memoryKeyService';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyRefZodSchema } from '../_common/zodSchemas/publicKeyRef';

const FindPublicKeyArgsZodSchema = z.object({
  publicKeyRef: PublicKeyRefZodSchema,
});

export const createSafeFindPublicKey = (context: MemoryKeyServiceContext): SafeFindPublicKey =>
  wrapInternalError('MemoryKeyService.FindPublicKey.Internal', async (args) => {
    const validArgs = FindPublicKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyService.FindPublicKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const keyPair = Object.values(context.keyPairs).find(
      ({ publicKeyRef }) => publicKeyRef === validArgs.data.publicKeyRef,
    );

    return result.ok(keyPair?.publicKey);
  });
