import * as z from 'zod/mini';
import type {
  CreateMemoryKeyService,
  MemoryKeyServiceContext,
  SafeCreateMemoryKeyService,
} from '../../types/memoryKeyService/memoryKeyService';
import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { PrivateKeyZodSchema } from './_common/zodSchemas/privateKey';
import { createSafeHasKey } from './hasKey';
import { createSafeSignData } from './signData';
import { toKeyPairs } from './toKeyPairs/toKeyPairs';

const KeySourceSchema = z.object({
  privateKey: PrivateKeyZodSchema,
});

const CreateMemoryKeyServiceArgsSchema = z.union([
  z.object({
    keySource: KeySourceSchema,
  }),
  z.object({
    keySources: z.array(KeySourceSchema).check(z.minLength(1)),
  }),
]);

export type InnerCreateMemoryKeyServiceArgs = z.infer<typeof CreateMemoryKeyServiceArgsSchema>;

export const safeCreateMemoryKeyService: SafeCreateMemoryKeyService = wrapInternalError(
  'CreateMemoryKeyService.Internal',
  (args) => {
    const validArgs = CreateMemoryKeyServiceArgsSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateMemoryKeyService.Args.InvalidSchema', {
        zodError: validArgs.error,
      });

    const context = {
      keyPairs: toKeyPairs(validArgs.data),
    } as MemoryKeyServiceContext;

    const safeHasKey = createSafeHasKey(context);
    const hasKey = asThrowable(safeHasKey);

    context.hasKey = hasKey;

    const safeSignData = createSafeSignData(context);
    const signData = asThrowable(safeSignData);

    return result.ok({
      hasKey,
      safeHasKey,
      signData,
      safeSignData,
    });
  },
);

export const createMemoryKeyService: CreateMemoryKeyService = asThrowable(
  safeCreateMemoryKeyService,
);
