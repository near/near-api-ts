import * as z from 'zod/mini';
import type {
  CreateSafeExecuteTransaction,
  SafeExecuteTransaction,
  UnreachableSendSignedTransactionKind,
} from '../../types/signer/public/createExecuteTransaction';
import { createNatError, isNatErrorOf } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { repackError } from '../_common/repackError';
import { TransactionProcessingStageZodSchema } from '../_common/zodSchemas/transactionProcessingStage';
import { PartialTransportPolicyZodSchema } from '../_common/zodSchemas/transportPolicy';
import { TransactionIntentZodSchema } from './_common/zodSchemas';

// The args the transaction is sent with are checked as sendSignedTransaction checks them
const ExecuteTransactionArgsSchema = z.object({
  intent: TransactionIntentZodSchema,
  minimalProcessingStage: z.optional(TransactionProcessingStageZodSchema),
  options: z.optional(
    z.object({
      transportPolicy: z.optional(PartialTransportPolicyZodSchema),
      signal: z.optional(z.instanceof(AbortSignal)),
      deserializeResultData: z.optional(z.instanceof(Function)),
      deserializeActionSummaries: z.optional(z.instanceof(Function)),
      deserializeExecutionSteps: z.optional(z.instanceof(Function)),
    }),
  ),
});

// Why a signer can't run into these, see UnreachableSendSignedTransactionKind
const unreachableSendSignedTransactionKinds = [
  'Client.SendSignedTransaction.Args.InvalidSchema',
  'Client.SendSignedTransaction.Internal',
  'Client.SendSignedTransaction.Rpc.Signature.Invalid',
] as const satisfies readonly UnreachableSendSignedTransactionKind[];

export const createSafeExecuteTransaction: CreateSafeExecuteTransaction = (context) =>
  wrapInternalError('Signer.ExecuteTransaction.Internal', async (args) => {
    const validArgs = ExecuteTransactionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Signer.ExecuteTransaction.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const taskResult = await context.taskQueue.addExecuteTransactionTask({
      transactionIntent: args.intent,
      sendingArgs: {
        minimalProcessingStage: args.minimalProcessingStage,
        options: args.options,
      },
    });
    if (taskResult.success) return taskResult;

    if (
      isNatErrorOf(taskResult.error, [
        'Signer.KeyPool.AccessKeys.NotLoaded',
        'Signer.KeyPool.Empty',
        'Signer.KeyPool.SignService.Failed',
        'Signer.KeyPool.SigningKey.NotFound',
        'Signer.TaskQueue.Timeout',
        'Signer.Aborted',
        'Signer.RecentBlockHash.NotLoaded',
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
  }) as SafeExecuteTransaction;
