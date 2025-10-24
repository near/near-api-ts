import { getSignedTransaction } from './helpers/getSignedTransaction';

export const signTransaction = async (
  signerContext: any,
  task: any,
  key: any,
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
