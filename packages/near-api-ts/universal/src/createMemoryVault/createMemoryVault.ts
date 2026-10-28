import * as z from 'zod/mini';
import type {
  CreateMemoryVault,
  MemoryVaultContext,
  SafeCreateMemoryVault,
} from '../../types/memoryVault/memoryVault';
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

const CreateMemoryVaultArgsSchema = z.union([
  z.object({
    keySource: KeySourceSchema,
  }),
  z.object({
    keySources: z.array(KeySourceSchema).check(z.minLength(1)),
  }),
]);

export type InnerCreateMemoryVaultArgs = z.infer<typeof CreateMemoryVaultArgsSchema>;

export const safeCreateMemoryVault: SafeCreateMemoryVault = wrapInternalError(
  'CreateMemoryVault.Internal',
  (args) => {
    const validArgs = CreateMemoryVaultArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateMemoryVault.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const context = {
      keyPairs: toKeyPairs(validArgs.data),
    } as MemoryVaultContext;

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

export const createMemoryVault: CreateMemoryVault = asThrowable(safeCreateMemoryVault);
