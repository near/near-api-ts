import { getSignedTransaction } from './helpers/getSignedTransaction';

export const executeTransaction = async (
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

    const result = await signerContext.client.sendSignedTransaction({
      signedTransaction,
    });

    key.incrementNonce();

    signerContext.resolver.completeTask(task.taskId, {
      result,
    });
  } catch (e) {
    signerContext.resolver.completeTask(task.taskId, { error: e });
  }
};
