import * as z from 'zod/mini';
import type { CreateSafeSignTransaction } from '../../types/signer/public/createSignTransaction';
import { createNatError, isNatErrorOf } from '../_common/_common/_common/_common/natError';
import { result } from '../_common/_common/_common/result';
import { wrapInternalError } from '../_common/_common/wrapInternalError';
import { repackError } from '../_common/repackError';
import { TransactionIntentZodSchema } from './_common/zodSchemas';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentZodSchema,
});

export const createSafeSignTransaction: CreateSafeSignTransaction = (context) =>
  wrapInternalError('Signer.SignTransaction.Internal', async (args) => {
    const validArgs = SignTransactionArgsSchema.safeParse(args);

    if (!validArgs.success)
      return result.err(
        createNatError({
          kind: 'Signer.SignTransaction.Args.InvalidSchema',
          context: { zodError: validArgs.error },
        }),
      );

    const signedTransaction = await context.taskQueue.addSignTransactionTask(args.intent);

    if (signedTransaction.success) return signedTransaction;

    // Repack some errors to make them method-specific
    if (
      isNatErrorOf(signedTransaction.error, [
        'Signer.KeyPool.AccessKeys.NotLoaded',
        'Signer.KeyPool.Empty',
        'Signer.KeyPool.SigningKey.NotFound',
        'Signer.TaskQueue.Timeout',
      ])
    )
      return repackError({
        error: signedTransaction.error,
        originPrefix: 'Signer',
        targetPrefix: 'Signer.SignTransaction',
      });

    return result.err(signedTransaction.error);
  });
