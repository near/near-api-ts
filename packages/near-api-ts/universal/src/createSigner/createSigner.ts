import * as z from 'zod/mini';
import type { SignService } from '../../types/_common/signService';
import type { Client } from '../../types/client/client';
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

const CreateSignerArgsSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  client: z.custom<Client>((value) => true), // TODO fix it
  signService: z.object({
    safeHasKeyPair: z.function(),
    safeGetPublicKey: z.function(),
    safeSignTransaction: z.function(),
  }),
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

    const { signerAccountId, client } = validArgs.data;
    // The sign service itself - the parsed copy keeps only the methods the schema names, wrapped
    const { signService } = args;

    const context = {
      signerAccountId,
      client,
      // Inside, the signer needs only what every sign service has
      signService: signService as SignService,
    } as SignerContext;

    context.keyPool = createKeyPool(context, args);
    context.taskQueue = createTaskQueue(context, args);
    context.tasker = createTasker(context);

    const safeSignTransaction = createSafeSignTransaction(context);
    const safeExecuteTransaction = createSafeExecuteTransaction(context);

    return result.ok({
      signerAccountId,
      signService,
      client,
      signTransaction: asThrowable(safeSignTransaction),
      executeTransaction: asThrowable(safeExecuteTransaction),
      safeSignTransaction,
      safeExecuteTransaction,
    });
  },
);

export const createSigner: CreateSigner = asThrowable(safeCreateSigner);
