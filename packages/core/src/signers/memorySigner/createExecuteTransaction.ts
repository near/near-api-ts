import * as z from 'zod/mini';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import { TransactionIntentSchema } from '@common/schemas/zod/transaction/transaction';
import { result } from '@common/utils/result';
import { createNatError, isNatErrorOf } from '@common/natError';
import type { CreateSafeExecuteTransaction } from 'nat-types/signers/memorySigner/createExecuteTransaction';
import { repackError } from '@common/utils/repackError';

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

      if (taskResult.error.kind === 'MemorySigner.Matcher.KeyForTaskNotFound')
        return repackError({
          error: taskResult.error,
          originPrefix: 'MemorySigner.Matcher',
          targetPrefix: 'MemorySigner.ExecuteTransaction',
        });

      if (
        taskResult.error.kind ===
        'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached'
      )
        return repackError({
          error: taskResult.error,
          originPrefix: 'MemorySigner.TaskQueue.Task',
          targetPrefix: 'MemorySigner.ExecuteTransaction',
        });

      // When we get some errors from the RPC, we want to repack particular errors
      // (which ones can actually happen) and return everything else as .Internal
      // The main goal is - return the only errors, which can actually happen during
      // .executeTransaction call;
      // And return everything else under .Internal
      if (
        taskResult.error.kind ===
        'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction'
      ) {
        if (
          isNatErrorOf(taskResult.error.context.cause, [
            'Client.SendSignedTransaction.SendRequest.Failed',
            'Client.SendSignedTransaction.Rpc.Transaction.Timeout',
            'Client.SendSignedTransaction.Rpc.Transaction.Receiver.NotFound',
            'Client.SendSignedTransaction.Rpc.Transaction.Signer.Balance.TooLow',
            'Client.SendSignedTransaction.Rpc.Transaction.Action.CreateAccount.AlreadyExist',
            'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.BelowThreshold',
            'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.Balance.TooLow',
            'Client.SendSignedTransaction.Rpc.Transaction.Action.Stake.NotFound',
          ])
        ) {
          return repackError({
            error: taskResult.error.context.cause,
            originPrefix: 'Client.SendSignedTransaction',
            targetPrefix: 'MemorySigner.ExecuteTransaction',
          });
        }
        throw taskResult.error.context.cause;
      }

      return result.err(taskResult.error);
    },
  );
