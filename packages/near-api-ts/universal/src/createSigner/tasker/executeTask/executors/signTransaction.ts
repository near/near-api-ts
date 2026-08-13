import type { Result } from '../../../../../types/_common/common';
import type {
  SignedTransaction,
  Transaction,
} from '../../../../../types/_common/transaction/transaction';
import type { PoolKey } from '../../../../../types/signer/inner/keyPool';
import type { Task } from '../../../../../types/signer/inner/taskQueue';
import type { MemorySignerContext } from '../../../../../types/signer/memorySigner';
import type { NatError } from '../../../../_common/_common/_common/natError';
import { result } from '../../../../_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';
import { signTransaction as signTransactionHelper } from '../../../../signServices/signTransaction/signTransaction';

type Execute = () => Promise<
  Result<SignedTransaction, NatError<'MemorySigner.SignTransaction.Internal'>>
>;

export const signTransaction = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: PoolKey,
): Promise<void> => {
  const execute: Execute = wrapInternalError('MemorySigner.SignTransaction.Internal', async () => {
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
    const signedTransaction = await signTransactionHelper({
      signDataProvider: signerContext.keyService,
      transaction,
    });

    key.setNonce(nextNonce);
    return result.ok(signedTransaction);
  });

  const transactionResult = await execute();
  signerContext.tasker.completeTask(task.taskId, transactionResult);
};
