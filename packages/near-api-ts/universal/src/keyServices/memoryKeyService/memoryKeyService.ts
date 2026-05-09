import * as z from 'zod/mini';
import type {
  CreateMemoryKeyService,
  MemoryKeyServiceContext,
  SafeCreateMemoryKeyService,
} from '../../../types/keyServices/memoryKeyService/memoryKeyService';
import { resultNatError } from '../../_common/natError';
import { PrivateKeyZodSchema } from '../../_common/schemas/zod/common/privateKey';
import { asThrowable } from '../../_common/utils/asThrowable';
import { result } from '../../_common/utils/result';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { toKeyPairs } from './inner/toKeyPairs';
import { createSafeHasKey } from './public/hasKey';
import { createSafeSignData } from './public/signData';

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

export const throwableCreateMemoryKeyService: CreateMemoryKeyService = asThrowable(
  safeCreateMemoryKeyService,
);
