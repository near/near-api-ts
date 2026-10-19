import * as z from 'zod/mini';
import type {
  CreateMemoryKeyVault,
  MemoryKeyVaultContext,
  SafeCreateMemoryKeyVault,
} from '../../types/memoryKeyVault/memoryKeyVault';
import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PrivateKeyZodSchema } from './_common/zodSchemas/privateKey';
import { createSafeFindPublicKey } from './findPublicKey';
import { createSafeHasKey } from './hasKey';
import { createSafeSignData } from './signData';
import { toKeyPairs } from './toKeyPairs/toKeyPairs';

const KeySourceSchema = z.object({
  privateKey: PrivateKeyZodSchema,
});

const CreateMemoryKeyVaultArgsSchema = z.union([
  z.object({
    keySource: KeySourceSchema,
  }),
  z.object({
    keySources: z.array(KeySourceSchema).check(z.minLength(1)),
  }),
]);

export type InnerCreateMemoryKeyVaultArgs = z.infer<typeof CreateMemoryKeyVaultArgsSchema>;

export const safeCreateMemoryKeyVault: SafeCreateMemoryKeyVault = wrapInternalError(
  'CreateMemoryKeyVault.Internal',
  (args) => {
    const validArgs = CreateMemoryKeyVaultArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateMemoryKeyVault.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const context = {
      keyPairs: toKeyPairs(validArgs.data),
    } as MemoryKeyVaultContext;

    const safeHasKey = createSafeHasKey(context);
    const hasKey = asThrowable(safeHasKey);

    context.hasKey = hasKey;

    const safeFindPublicKey = createSafeFindPublicKey(context);
    const findPublicKey = asThrowable(safeFindPublicKey);

    const safeSignData = createSafeSignData(context);
    const signData = asThrowable(safeSignData);

    return result.ok({
      hasKey,
      safeHasKey,
      findPublicKey,
      safeFindPublicKey,
      signData,
      safeSignData,
    });
  },
);

export const createMemoryKeyVault: CreateMemoryKeyVault = asThrowable(safeCreateMemoryKeyVault);
