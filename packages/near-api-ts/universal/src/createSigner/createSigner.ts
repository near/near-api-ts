import * as z from 'zod/mini';
import type { Client } from '../../types/client/client';
import type { MemoryVault } from '../../types/memoryVault/memoryVault';
import type { CreateSigner, SafeCreateSigner } from '../../types/signer/createSigner';
import type { SignerContext } from '../../types/signer/signer';
import { createNatError } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';
import { createSafeExecuteTransaction } from './createExecuteTransaction';
import { createKeyPool } from './createKeyPool/createKeyPool';
import { createSafeSignTransaction } from './createSignTransaction';
import { createTasker } from './createTasker/createTasker';
import { createTaskQueue } from './createTaskQueue/createTaskQueue';

// keyVault: z.object({
//   safeSignData: z.custom<SafeSignData>(
//     (val) => typeof val === 'function',
//     'keyVault.safeSignData must be a function', // TODO compete
//   ),
// }),

const CreateSignerArgsSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  client: z.custom<Client>((value) => true), // TODO fix it
  keyVault: z.custom<MemoryVault>((value) => true), // TODO fix it
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

export const safeCreateSigner: SafeCreateSigner = wrapInternalError(
  'CreateSigner.Internal',
  (args) => {
    const validArgs = CreateSignerArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'CreateSigner.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const { signerAccountId, client, keyVault } = validArgs.data;

    const context = {
      signerAccountId,
      client,
      keyVault,
    } as SignerContext;

    context.keyPool = createKeyPool(context, args);
    context.taskQueue = createTaskQueue(context, args);
    context.tasker = createTasker(context);

    const safeSignTransaction = createSafeSignTransaction(context);
    const safeExecuteTransaction = createSafeExecuteTransaction(context);

    return result.ok({
      signerAccountId,
      keyVault,
      client,
      signTransaction: asThrowable(safeSignTransaction),
      executeTransaction: asThrowable(safeExecuteTransaction),
      safeSignTransaction,
      safeExecuteTransaction,
    });
  },
);

export const createSigner: CreateSigner = asThrowable(safeCreateSigner);
