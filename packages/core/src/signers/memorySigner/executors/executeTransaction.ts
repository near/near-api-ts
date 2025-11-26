import * as z from 'zod/mini';
import { hasRpcErrorCode } from '../../../client/rpcError';
import type { Nonce, Result } from 'nat-types/_common/common';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import { result } from '@common/utils/result';
import type { Transaction } from 'nat-types/transaction';

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
    return result.ok({
      akNonce:
        validated.data.__rawRpcError.data.TxExecutionError.InvalidTxError
          .InvalidNonce.akNonce,
    });
  return result.err(undefined);
};

export const executeTransaction = async (
  signerContext: SignerContext,
  task: Task,
  key: KeyPoolKey,
) => {
  const maxAttempts = 3; // Maybe we will allow user to configure it in the future

  const attempt = async (
    attemptIndex: number,
    newNonce: Nonce,
  ): Promise<Result<unknown, unknown>> => {
    try {
      const transaction: Transaction = {
        ...task.transactionIntent,
        signerAccountId: signerContext.signerAccountId,
        signerPublicKey: key.publicKey,
        nonce: newNonce,
        blockHash: signerContext.state.getBlockHash(),
      };

      const signedTransaction = await signerContext.keyService.signTransaction({
        transaction,
      });

      const txResult = await signerContext.client.sendSignedTransaction({
        signedTransaction,
      });

      key.setNonce(newNonce);

      return result.ok(txResult);
    } catch (e) {
      // If last attempt
      if (attemptIndex >= maxAttempts - 1) return result.err(e);

      // MemorySigner.ExecuteTransaction.Client.SendSignedTransaction
      const nonceError = maybeNonceError(e);
      if (nonceError.ok)
        return await attempt(attemptIndex + 1, nonceError.value.akNonce + 1);

      return result.err(e);
    }
  };

  const executeTransactionResult = await attempt(0, key.nonce + 1);
  signerContext.resolver.completeTask(task.taskId, executeTransactionResult);
};
