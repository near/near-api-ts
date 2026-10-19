import * as z from 'zod/mini';
import type { SafeFindPublicKey } from '../../types/memoryKeyVault/findPublicKey';
import type { MemoryKeyVaultContext } from '../../types/memoryKeyVault/memoryKeyVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PublicKeyRefZodSchema } from '../_common/zodSchemas/publicKeyRef';

const FindPublicKeyArgsZodSchema = z.object({
  publicKeyRef: PublicKeyRefZodSchema,
});

export const createSafeFindPublicKey = (context: MemoryKeyVaultContext): SafeFindPublicKey =>
  wrapInternalError('MemoryKeyVault.FindPublicKey.Internal', async (args) => {
    const validArgs = FindPublicKeyArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('MemoryKeyVault.FindPublicKey.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const keyPair = Object.values(context.keyPairs).find(
      ({ publicKeyRef }) => publicKeyRef === validArgs.data.publicKeyRef,
    );

    return result.ok(keyPair?.publicKey);
  });
