import * as z from 'zod/mini';
import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createTasker } from './tasker/createTasker';
import type { MemorySignerContext } from '../../../types/signers/memorySigner/memorySigner';
import type {
  CreateMemorySigner,
  CreateMemorySignerFactory,
  CreateSafeMemorySignerFactory,
  SafeCreateMemorySigner,
} from '../../../types/signers/memorySigner/createMemorySigner';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import { result } from '../../_common/utils/result';
import { asThrowable } from '../../_common/utils/asThrowable';
import { AccountIdSchema } from '../../_common/schemas/zod/common/accountId';
import { PublicKeySchema } from '../../_common/schemas/zod/common/publicKey';
import { isClient } from '../../client/createClient';
import { isMemoryKeyService } from '../../keyServices/memoryKeyService/createMemoryKeyService';
import { createNatError } from '../../_common/natError';
import type { Client } from '../../../types/client/client';
import type { MemoryKeyService } from '../../../types/keyServices/memoryKeyService/memoryKeyService';
import { createSafeSignTransaction } from './createSignTransaction';
import { createSafeExecuteTransaction } from './createExecuteTransaction';

const CreateMemorySignerArgsSchema = z.object({
  signerAccountId: AccountIdSchema,
  client: z.custom<Client>((value) => isClient(value)),
  keyService: z.custom<MemoryKeyService>((value) => isMemoryKeyService(value)),
  keyPool: z.optional(
    z.object({
      allowedAccessKeys: z.optional(
        z.array(PublicKeySchema).check(z.minLength(1)),
      ),
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

export const throwableCreateMemorySigner: CreateMemorySigner = asThrowable(
  safeCreateMemorySigner,
);

export const createSafeMemorySignerFactory: CreateSafeMemorySignerFactory =
  (args) => (signerAccountId) =>
    safeCreateMemorySigner({ ...args, signerAccountId });

export const createThrowableMemorySignerFactory: CreateMemorySignerFactory =
  (args) => (signerAccountId) =>
    throwableCreateMemorySigner({ ...args, signerAccountId });
