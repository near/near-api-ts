import * as z from 'zod/mini';
import type { SignService } from '../../types/_common/signService';
import type { CreateSigner, SafeCreateSigner } from '../../types/signer/createSigner';
import type { SignerContext } from '../../types/signer/signer';
import type { SignerClient } from '../../types/signer/signerClient';

import { result, resultNatError } from '../_common/_common/_common/result';
import { asThrowable } from '../_common/_common/asThrowable';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { AccountIdZodSchema } from '../_common/zodSchemas/accountId';
import { PublicKeyZodSchema } from '../_common/zodSchemas/publicKey';
import { createSafeExecuteTransaction } from './createExecuteTransaction';
import { createKeyPool } from './createKeyPool/createKeyPool';
import { createSafeSignTransaction } from './createSignTransaction';
import { createTasker } from './createTasker/createTasker';
import { createTaskQueue } from './createTaskQueue/createTaskQueue';

const CreateSignerArgsZodSchema = z.object({
  signerAccountId: AccountIdZodSchema,
  client: z.object({
    safeGetAccessKeys: z.function(),
    safeGetRecentBlockHash: z.function(),
    safeSendSignedTransaction: z.function(),
  }),
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
    const validArgs = CreateSignerArgsZodSchema.safeParse(args);

    if (!validArgs.success)
      return resultNatError('CreateSigner.Args.InvalidSchema', { zodError: validArgs.error });

    const { signerAccountId } = validArgs.data;
    // The objects themselves - the parsed copy keeps only the methods the schema names, wrapped
    const { client, signService } = args;

    const context = {
      signerAccountId,
      // Inside, the signer needs only what every client and sign service has
      client: client as SignerClient,
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
