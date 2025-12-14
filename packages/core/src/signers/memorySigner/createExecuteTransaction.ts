import * as z from 'zod/mini';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { TransactionIntentSchema } from '@common/schemas/zod/transaction/transaction';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type { CreateSafeExecuteTransaction } from 'nat-types/signers/memorySigner/createExecuteTransaction';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentSchema,
});

export const createSafeExecuteTransaction: CreateSafeExecuteTransaction = (
  context,
) =>
  wrapInternalError(
    'MemorySigner.ExecuteTransaction.Internal',
    async (args) => {
      const validArgs = SignTransactionArgsSchema.safeParse(args);

      if (!validArgs.success)
        return result.err(
          createNatError({
            kind: 'MemorySigner.ExecuteTransaction.Args.InvalidSchema',
            context: { zodError: validArgs.error },
          }),
        );

      const taskResult = await context.taskQueue.addExecuteTransactionTask(
        args.intent,
      );

      if (taskResult.ok) return taskResult;

      if (taskResult.error.kind === 'MemorySigner.Matcher.NoKeysForTaskFound') {
        return result.err(
          createNatError({
            kind: 'MemorySigner.ExecuteTransaction.KeyForTaskNotFound',
            context: taskResult.error.context,
          }),
        );
      }

      if (
        taskResult.error.kind ===
        'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached'
      )
        return result.err(
          createNatError({
            kind: 'MemorySigner.ExecuteTransaction.MaxTimeInTaskQueueReached',
            context: {
              maxWaitInQueueMs: taskResult.error.context.maxWaitInQueueMs,
            },
          }),
        );

      if (
        taskResult.error.kind ===
        'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction'
      )
        throw taskResult.error; // TODO repack

      return result.err(taskResult.error);
    },
  );
