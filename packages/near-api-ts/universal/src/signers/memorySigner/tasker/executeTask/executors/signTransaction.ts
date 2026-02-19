import { result } from '../../../../../_common/utils/result';
import type { MemorySignerContext } from '../../../../../../types/signers/memorySigner/memorySigner';
import type { Task } from '../../../../../../types/signers/memorySigner/inner/taskQueue';
import type { PoolKey } from '../../../../../../types/signers/memorySigner/inner/keyPool';
import type { SignedTransaction, Transaction } from '../../../../../../types/_common/transaction/transaction';
import { wrapInternalError } from '../../../../../_common/utils/wrapInternalError';
import type { Result } from '../../../../../../types/_common/common';
import type { NatError } from '../../../../../_common/natError';

type Execute = () => Promise<
  Result<SignedTransaction, NatError<'MemorySigner.SignTransaction.Internal'>>
>;

export const signTransaction = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: PoolKey,
): Promise<void> => {
  const execute: Execute = wrapInternalError(
    'MemorySigner.SignTransaction.Internal',
    async () => {
      const nextNonce = key.nonce + 1;
      const blockHash = await signerContext.client.getRecentBlockHash();

      const transaction: Transaction = {
        ...task.transactionIntent,
        signerAccountId: signerContext.signerAccountId,
        signerPublicKey: key.publicKey,
        nonce: nextNonce,
        blockHash,
      };

      // This call will never fail
      const signedTransaction = await signerContext.keyService.signTransaction({
        transaction,
      });

      key.setNonce(nextNonce);
      return result.ok(signedTransaction);
    },
  );

  const transactionResult = await execute();
  signerContext.tasker.completeTask(task.taskId, transactionResult);
};
