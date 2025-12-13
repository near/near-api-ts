import { result } from '@common/utils/result';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { Transaction } from 'nat-types/transaction';

export const signTransaction = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: KeyPoolKey,
): Promise<void> => {
  try {
    const nextNonce = key.nonce + 1;

    const transaction: Transaction = {
      ...task.transactionIntent,
      signerAccountId: signerContext.signerAccountId,
      signerPublicKey: key.publicKey,
      nonce: nextNonce,
      blockHash: signerContext.state.getBlockHash(),
    };

    const signedTransaction = await signerContext.keyService.signTransaction({
      transaction,
    });

    key.setNonce(nextNonce);

    signerContext.resolver.completeTask(
      task.taskId,
      result.ok(signedTransaction),
    );
  } catch (e) {
    // TODO remove catch
    signerContext.resolver.completeTask(task.taskId, result.err(e));
  }
};
