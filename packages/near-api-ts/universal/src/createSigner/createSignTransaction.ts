import * as z from 'zod/mini';
import type { CreateSafeSignTransaction } from '../../types/signer/public/createSignTransaction';
import { createNatError, isNatErrorOf } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { repackError } from '../_common/repackError';
import { TransactionIntentZodSchema } from '../transaction/_common/zodSchemas/transaction/transaction';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentZodSchema,
});

export const createSafeSignTransaction: CreateSafeSignTransaction = (context) =>
  wrapInternalError('MemorySigner.SignTransaction.Internal', async (args) => {
    const validArgs = SignTransactionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'MemorySigner.SignTransaction.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const signedTransaction = await context.taskQueue.addSignTransactionTask(args.intent);

    if (signedTransaction.ok) return signedTransaction;

    // Repack some errors to make them method-specific
    if (
      isNatErrorOf(signedTransaction.error, [
        'MemorySigner.KeyPool.AccessKeys.NotLoaded',
        'MemorySigner.KeyPool.Empty',
        'MemorySigner.KeyPool.SigningKey.NotFound',
        'MemorySigner.TaskQueue.Timeout',
      ])
    )
      return repackError({
        error: signedTransaction.error,
        originPrefix: 'MemorySigner',
        targetPrefix: 'MemorySigner.SignTransaction',
      });

    return result.err(signedTransaction.error);
  });
