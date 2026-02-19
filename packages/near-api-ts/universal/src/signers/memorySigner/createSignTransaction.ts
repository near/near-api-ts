import * as z from 'zod/mini';
import { wrapInternalError } from '../../_common/utils/wrapInternalError';
import type { CreateSafeSignTransaction } from '../../../types/signers/memorySigner/public/createSignTransaction';
import { TransactionIntentSchema } from '../../_common/schemas/zod/transaction/transaction';
import { result } from '../../_common/utils/result';
import { createNatError, isNatErrorOf } from '../../_common/natError';
import { repackError } from '../../_common/utils/repackError';

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
