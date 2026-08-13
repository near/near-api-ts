import * as z from 'zod/mini';
import type { Client } from '../../types/client/client';
import type { MemoryKeyService } from '../../types/memoryKeyService/memoryKeyService';
import type {
  CreateMemorySigner,
  CreateMemorySignerFactory,
  CreateSafeMemorySignerFactory,
  SafeCreateMemorySigner,
} from '../../types/signer/createMemorySigner';
import type { MemorySignerContext } from '../../types/signer/memorySigner';
import { createNatError } from '../_common/_common/_common/natError';
import { asThrowable } from '../_common/_common/asThrowable';
import { result } from '../_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';
import { isClient } from '../createClient/createClient';
import { createSafeExecuteTransaction } from './createExecuteTransaction';
import { createSafeSignTransaction } from './createSignTransaction';
import { createKeyPool } from './keyPool/createKeyPool';
import { createTasker } from './tasker/createTasker';
import { createTaskQueue } from './taskQueue/createTaskQueue';

// keyService: z.object({
//   safeSignData: z.custom<SafeSignData>(
//     (val) => typeof val === 'function',
//     'keyService.safeSignData must be a function', // TODO compete
//   ),
// }),

const CreateMemorySignerArgsSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  client: z.custom<Client>((value) => isClient(value)), // TODO fix it
  keyService: z.custom<MemoryKeyService>((value) => true), // TODO fix it
  keyPool: z.optional(
    z.object({
      allowedAccessKeys: z.optional(z.array(PublicKeyZodSchema).check(z.minLength(1))),
    }),
  ),
  taskQueue: z.optional(
    z.object({
      timeoutMs: z.optional(z.number().check(z.nonnegative())),
    }),
  ),
});

export const safeCreateMemorySigner: SafeCreateMemorySigner = wrapInternalError(
  'CreateMemorySigner.Internal',
  (args) => {
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
    } as MemorySignerContext;

    context.keyPool = createKeyPool(context, args);
    context.taskQueue = createTaskQueue(context, args);
    context.tasker = createTasker(context);

    const safeSignTransaction = createSafeSignTransaction(context);
    const safeExecuteTransaction = createSafeExecuteTransaction(context);

    return result.ok({
      signerAccountId,
      keyService,
      client,
      signTransaction: asThrowable(safeSignTransaction),
      executeTransaction: asThrowable(safeExecuteTransaction),
      safeSignTransaction,
      safeExecuteTransaction,
    });
  },
);

export const createMemorySigner: CreateMemorySigner = asThrowable(safeCreateMemorySigner);

export const createSafeMemorySignerFactory: CreateSafeMemorySignerFactory =
  (args) => (signerAccountId) =>
    safeCreateMemorySigner({ ...args, signerAccountId });

export const createMemorySignerFactory: CreateMemorySignerFactory = (args) => (signerAccountId) =>
  createMemorySigner({ ...args, signerAccountId });
