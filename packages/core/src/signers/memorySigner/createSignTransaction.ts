import * as z from 'zod/mini';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import type { CreateSafeSignTransaction } from 'nat-types/signers/memorySigner/createSignTransaction';
import { TransactionIntentSchema } from '@common/schemas/zod/transaction/transaction';
import { result } from '@common/utils/result';
import { createNatError, isNatErrorOf } from '@common/natError';
import { repackError } from '@common/utils/repackError';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentSchema,
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

    const signedTransaction = await context.taskQueue.addSignTransactionTask(
      args.intent,
    );

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
