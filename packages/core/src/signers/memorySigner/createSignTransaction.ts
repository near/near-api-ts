import * as z from 'zod/mini';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import type { CreateSafeSignTransaction } from 'nat-types/signers/memorySigner/createSignTransaction';
import { TransactionIntentSchema } from '@common/schemas/zod/transaction/transaction';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
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

    if (
      signedTransaction.error.kind === 'MemorySigner.Matcher.KeyForTaskNotFound'
    ) {
      return repackError({
        error: signedTransaction.error,
        originPrefix: 'MemorySigner.Matcher',
        targetPrefix: 'MemorySigner.SignTransaction',
      });
    }

    if (
      signedTransaction.error.kind ===
      'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached'
    )
      return repackError({
        error: signedTransaction.error,
        originPrefix: 'MemorySigner.TaskQueue.Task',
        targetPrefix: 'MemorySigner.SignTransaction',
      });

    return result.err(signedTransaction.error);
  });
