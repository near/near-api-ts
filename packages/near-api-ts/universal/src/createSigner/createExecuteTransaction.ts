import * as z from 'zod/mini';
import type {
  CreateSafeExecuteTransaction,
  UnreachableSendSignedTransactionKind,
} from '../../types/signer/public/createExecuteTransaction';
import { createNatError, isNatErrorOf } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { repackError } from '../_common/repackError';
import { TransactionIntentZodSchema } from './_common/zodSchemas';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentZodSchema,
});

// Why a signer can't run into these, see UnreachableSendSignedTransactionKind
const unreachableSendSignedTransactionKinds = [
  'Client.SendSignedTransaction.Args.InvalidSchema',
  'Client.SendSignedTransaction.Internal',
  'Client.SendSignedTransaction.Rpc.Signature.Invalid',
  'Client.SendSignedTransaction.Aborted',
  'Client.SendSignedTransaction.DeserializeResultData.Failed',
  'Client.SendSignedTransaction.DeserializeActionSummaries.Failed',
  'Client.SendSignedTransaction.DeserializeExecutionSteps.Failed',
] as const satisfies readonly UnreachableSendSignedTransactionKind[];

export const createSafeExecuteTransaction: CreateSafeExecuteTransaction = (context) =>
  wrapInternalError('Signer.ExecuteTransaction.Internal', async (args) => {
    const validArgs = SignTransactionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Signer.ExecuteTransaction.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const taskResult = await context.taskQueue.addExecuteTransactionTask(args.intent);
    if (taskResult.success) return taskResult;

    if (
      isNatErrorOf(taskResult.error, [
        'Signer.KeyPool.AccessKeys.NotLoaded',
        'Signer.KeyPool.Empty',
        'Signer.KeyPool.SignService.Failed',
        'Signer.KeyPool.SigningKey.NotFound',
        'Signer.TaskQueue.Timeout',
      ])
    )
      return repackError({
        error: taskResult.error,
        originPrefix: 'Signer',
        targetPrefix: 'Signer.ExecuteTransaction',
      });

    // A send error goes on under the signer's prefix, unless a signer can't run into it -
    // then it is a bug, and the Internal it becomes carries that error as the cause
    if (
      taskResult.error.kind === 'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction'
    ) {
      const { cause } = taskResult.error.context;
      if (isNatErrorOf(cause, unreachableSendSignedTransactionKinds)) throw cause;

      return repackError({
        error: cause,
        originPrefix: 'Client.SendSignedTransaction',
        targetPrefix: 'Signer.ExecuteTransaction',
      });
    }

    return result.err(taskResult.error);
  });
