import * as z from 'zod/mini';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import type { CreateSafeSignTransaction } from 'nat-types/signers/memorySigner/createSignTransaction';
import { TransactionIntentSchema } from '@common/schemas/zod/transaction/transaction';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

const SignTransactionArgsSchema = z.object({
  intent: TransactionIntentSchema,
});

export const createSafeExecuteTransaction: CreateSafeSignTransaction = (context) =>
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

    if (!signedTransaction.ok) {
      if (
        signedTransaction.error.kind ===
        'MemorySigner.Matcher.NoKeysForTaskFound'
      ) {
        return result.err(
          createNatError({
            kind: 'MemorySigner.SignTransaction.KeyForTaskNotFound',
            context: signedTransaction.error.context,
          }),
        );
      }
      return result.err(signedTransaction.error);
    }

    return signedTransaction;
  });
