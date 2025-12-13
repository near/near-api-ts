import * as z from 'zod/mini';
import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import { createState } from './state/createState';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  CreateMemorySigner,
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

// NextFeature: move block hash to the client level and make it lazy

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

    const [keyPool, state] = await Promise.all([
      createKeyPool(context),
      createState(context),
    ]);

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

    if (!state.ok)
      return result.err(
        createNatError({
          kind: 'CreateMemorySigner.Internal',
          context: { cause: state.error },
        }),
      );

    context.keyPool = keyPool.value;
    context.state = state.value;
    // context.taskQueue = createTaskQueue(context);
    // context.matcher = createMatcher(context);
    // context.resolver = createResolver();

    return result.ok({
      signerAccountId,
      // executeTransaction: context.taskQueue.executeTransaction, // add throwErrors
      // signTransaction: context.taskQueue.signTransaction,
      // TODO return stop() which will clear all signer intervals
    });
  },
);

export const throwableCreateMemorySigner: CreateMemorySigner = asThrowable(
  safeCreateMemorySigner,
);
