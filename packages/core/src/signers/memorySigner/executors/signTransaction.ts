import { getSignedTransaction } from './helpers/getSignedTransaction';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';

export const signTransaction = async (
  signerContext: SignerContext,
  task: Task,
  key: KeyPoolKey,
) => {
  try {
    const nextNonce = key.nonce + 1;

    const signedTransaction = getSignedTransaction(
      signerContext,
      task,
      key,
      nextNonce,
    );

    key.setNonce(nextNonce);

    signerContext.resolver.completeTask(task.taskId, {
      result: signedTransaction,
    });
  } catch (e) {
    signerContext.resolver.completeTask(task.taskId, { error: e });
  }
};
