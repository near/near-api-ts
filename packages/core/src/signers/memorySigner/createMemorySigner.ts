import * as z from 'zod/mini';
import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  CreateMemorySigner,
  CreateMemorySignerFactory,
  CreateSafeMemorySignerFactory,
  SafeCreateMemorySigner,
} from 'nat-types/signers/memorySigner/createMemorySigner';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { result } from '@common/utils/result';
import { asThrowable } from '@common/utils/asThrowable';
import { AccountIdSchema } from '@common/schemas/zod/common/accountId';
import { PublicKeySchema } from '@common/schemas/zod/common/publicKey';
import { isClient } from '../../client/createClient';
import { isMemoryKeyService } from '../../keyServices/memoryKeyService/createMemoryKeyService';
import { createNatError } from '@common/natError';
import type { Client } from 'nat-types/client/client';
import type { MemoryKeyService } from 'nat-types/keyServices/memoryKeyService/memoryKeyService';
import { createSafeSignTransaction } from './createSignTransaction';
import { createSafeExecuteTransaction } from './createExecuteTransaction';

const CreateMemorySignerArgsSchema = z.object({
  signerAccountId: AccountIdSchema,
  client: z.custom<Client>((value) => isClient(value)),
  keyService: z.custom<MemoryKeyService>((value) => isMemoryKeyService(value)),
  keyPool: z.optional(
    z.object({
      signingKeys: z.optional(z.array(PublicKeySchema).check(z.minLength(1))),
    }),
  ),
  taskQueue: z.optional(
    z.object({
      maxWaitInQueueMs: z.optional(z.number().check(z.nonnegative())),
    }),
  ),
});

export const safeCreateMemorySigner: SafeCreateMemorySigner = wrapInternalError(
  'CreateMemorySigner.Internal',
  async (args) => {
    const validArgs = CreateMemorySignerArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateMemorySigner.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const { signerAccountId, client, keyService } = validArgs.data;

    const context = {
      signerAccountId,
      client,
      keyService,
      signingKeys: args.keyPool?.signingKeys,
      maxWaitInQueueMs: args.taskQueue?.maxWaitInQueueMs ?? 60_000, // 1 min
    } as MemorySignerContext;

    const keyPool = await createKeyPool(context);

    if (!keyPool.ok) {
      if (keyPool.error.kind === 'CreateMemorySigner.CreateKeyPool.Failed')
        return result.err(
          createNatError({
            kind: 'CreateMemorySigner.Internal',
            context: { cause: keyPool.error },
          }),
        );
      return result.err(keyPool.error);
    }

    context.keyPool = keyPool.value;
    context.taskQueue = createTaskQueue(context);
    context.matcher = createMatcher(context);
    context.resolver = createResolver();

    const safeSignTransaction = createSafeSignTransaction(context);
    const safeExecuteTransaction = createSafeExecuteTransaction(context);

    return result.ok({
      signerAccountId,
      signTransaction: asThrowable(safeSignTransaction),
      executeTransaction: asThrowable(safeExecuteTransaction),
      safeSignTransaction,
      safeExecuteTransaction,
    });
  },
);

export const throwableCreateMemorySigner: CreateMemorySigner = asThrowable(
  safeCreateMemorySigner,
);

export const createSafeMemorySignerFactory: CreateSafeMemorySignerFactory =
  (args) => (signerAccountId) =>
    safeCreateMemorySigner({ ...args, signerAccountId });

export const createThrowableMemorySignerFactory: CreateMemorySignerFactory =
  (args) => (signerAccountId) =>
    throwableCreateMemorySigner({ ...args, signerAccountId });
