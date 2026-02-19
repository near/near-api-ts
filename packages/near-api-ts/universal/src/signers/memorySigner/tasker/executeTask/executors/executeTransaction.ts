import type { Nonce, Result } from '@universal/types/_common/common';
import type { Transaction } from '@universal/types/_common/transaction/transaction';
import type { SendSignedTransactionOutput } from '@universal/types/client/methods/transaction/sendSignedTransaction';
import type { PoolKey } from '@universal/types/signers/memorySigner/inner/keyPool';
import type { Task } from '@universal/types/signers/memorySigner/inner/taskQueue';
import type { MemorySignerContext } from '@universal/types/signers/memorySigner/memorySigner';
import { createNatError, type NatError } from '../../../../../_common/natError';
import { result } from '../../../../../_common/utils/result';
import { wrapInternalError } from '../../../../../_common/utils/wrapInternalError';

type Attempt = (
  attemptIndex: number,
  newNonce: Nonce,
) => Promise<
  Result<
    SendSignedTransactionOutput,
    | NatError<'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction'>
    | NatError<'MemorySigner.ExecuteTransaction.Internal'>
  >
>;

export const executeTransaction = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: PoolKey,
): Promise<void> => {
  const maxAttempts = 3; // Maybe we will allow user to configure it in the future

  const attempt: Attempt = wrapInternalError(
    'MemorySigner.ExecuteTransaction.Internal',
    async (attemptIndex, newNonce) => {
      const blockHash = await signerContext.client.getRecentBlockHash();

      const transaction: Transaction = {
        ...task.transactionIntent,
        signerAccountId: signerContext.signerAccountId,
        signerPublicKey: key.publicKey,
        nonce: newNonce,
        blockHash,
      };

      // This call will never fail
      const signedTransaction = await signerContext.keyService.signTransaction({
        transaction,
      });

      const txResult = await signerContext.client.safeSendSignedTransaction({
        signedTransaction,
      });

      // If tx executed successfully - update key nonce and return tx execution result;
      if (txResult.ok) {
        key.setNonce(newNonce);
        return txResult;
      }

      // If it's not a last attempt + it's a nonce error -
      // re-sign with the new nonce and try to send it again;
      if (
        attemptIndex <= maxAttempts &&
        txResult.error.kind ===
          'Client.SendSignedTransaction.Rpc.Transaction.Nonce.Invalid'
      ) {
        return await attempt(
          attemptIndex + 1,
          txResult.error.context.accessKeyNonce + 1,
        );
      }

      // Pack sendSignedTransaction error and return;
      return result.err(
        createNatError({
          kind: 'MemorySigner.Executors.ExecuteTransaction.Client.SendSignedTransaction',
          context: { cause: txResult.error },
        }),
      );
    },
  );

  const executeTransactionResult = await attempt(1, key.nonce + 1);

  signerContext.tasker.completeTask(task.taskId, executeTransactionResult);
};
