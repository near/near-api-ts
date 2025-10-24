import * as z from 'zod/mini';
import { getSignedTransaction } from './helpers/getSignedTransaction';
import { hasRpcErrorCode } from '../../../client/rpcError';
import type { Nonce, Result } from 'nat-types/common';

const NonceErrorSchema = z.object({
  __rawRpcError: z.object({
    data: z.object({
      TxExecutionError: z.object({
        InvalidTxError: z.object({
          InvalidNonce: z.object({
            akNonce: z.number(),
            txNonce: z.number(),
          }),
        }),
      }),
    }),
  }),
});

const maybeNonceError = (e: unknown): Result<{ akNonce: Nonce }, undefined> => {
  const validated = NonceErrorSchema.safeParse(e);
  if (hasRpcErrorCode(e, ['HandlerError']) && validated.success)
    return {
      result: {
        akNonce:
          validated.data.__rawRpcError.data.TxExecutionError.InvalidTxError
            .InvalidNonce.akNonce,
      },
    };
  return { error: undefined };
};

export const executeTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  const maxAttempts = 3; // Maybe we will allow user to configure it in the future

  const attempt = async (attemptIndex: number, newNonce: number) => {
    try {
      const signedTransaction = getSignedTransaction(
        signerContext,
        task,
        key,
        newNonce,
      );

      const result = await signerContext.client.sendSignedTransaction({
        signedTransaction,
      });

      key.setNonce(newNonce);

      return { result };
    } catch (e) {
      // If last attempt
      if (attemptIndex >= maxAttempts - 1) return { error: e };

      const nonceError = maybeNonceError(e);
      if (nonceError.result)
        return await attempt(attemptIndex + 1, nonceError.result.akNonce + 1);

      return { error: e };
    }
  };

  const result = await attempt(0, key.nonce + 1);
  signerContext.resolver.completeTask(task.taskId, result);
};
