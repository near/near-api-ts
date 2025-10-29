import * as z from 'zod/mini';
import { getSignedTransaction } from './helpers/getSignedTransaction';
import { hasRpcErrorCode } from '../../../client/rpcError';
import type { Nonce, Result } from 'nat-types/common';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

/*
"data": {
    "TxExecutionError": {
      "InvalidTxError": {
        "InvalidAccessKeyError": {
          "NotEnoughAllowance": {
            "accountId": "user.nat",
            "allowance": "100",
            "cost": "1119831546455600000000",
            "publicKey": "ed25519:DT5gLSaN4b8GHKFafMozJtVB62pqtXWgt9X74d6ahXm8"
          }
        }
      }
    }
 */

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
  signerContext: SignerContext,
  task: Task,
  key: KeyPoolKey,
) => {
  const maxAttempts = 3; // Maybe we will allow user to configure it in the future

  const attempt = async (attemptIndex: number, newNonce: Nonce) => {
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
