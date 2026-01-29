import * as z from 'zod/mini';
import { createSafeSignTransaction } from './createSignTransaction';
import { getKeyPairs } from './getKeyPairs';
import { createSafeFindKeyPair } from './createFindKeyPair';
import { asThrowable } from '@common/utils/asThrowable';
import { result } from '@common/utils/result';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import type {
  MemoryKeyService,
  MemoryKeyServiceContext,
} from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import type {
  CreateMemoryKeyService,
  SafeCreateMemoryKeyService,
} from 'nat-types/keyServices/memoryKeyService/createMemoryKeyService';
import { PrivateKeySchema } from '@common/schemas/zod/common/privateKey';
import { createNatError } from '@common/natError';

export const MemoryKeyServiceBrand = Symbol('MemoryKeyService');

export const isMemoryKeyService = (value: unknown): value is MemoryKeyService =>
  typeof value === 'object' && value !== null && MemoryKeyServiceBrand in value;

const KeySourceSchema = z.object({
  privateKey: PrivateKeySchema,
});

const CreateMemoryKeyServiceArgsSchema = z.union([
  z.object({
    keySource: KeySourceSchema,
  }),
  z.object({
    keySources: z.array(KeySourceSchema).check(z.minLength(1)),
  }),
]);

export type InnerCreateMemoryKeyServiceArgs = z.infer<
  typeof CreateMemoryKeyServiceArgsSchema
>;

export const safeCreateMemoryKeyService: SafeCreateMemoryKeyService =
  wrapInternalError('CreateMemoryKeyService.Internal', (args) => {
    const validArgs = CreateMemoryKeyServiceArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateMemoryKeyService.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const context = {
      keyPairs: getKeyPairs(validArgs.data),
    } as MemoryKeyServiceContext;

    const safeFindKeyPair = createSafeFindKeyPair(context);
    const safeSignTransaction = createSafeSignTransaction(context);

    context.safeFindKeyPair = safeFindKeyPair;

    return result.ok({
      [MemoryKeyServiceBrand]: true as const,
      signTransaction: asThrowable(safeSignTransaction),
      safeSignTransaction,
      findKeyPair: asThrowable(safeFindKeyPair),
      safeFindKeyPair,
    });
  });

export const throwableCreateMemoryKeyService: CreateMemoryKeyService =
  asThrowable(safeCreateMemoryKeyService);
