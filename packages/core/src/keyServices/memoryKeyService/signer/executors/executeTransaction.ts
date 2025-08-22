import { getSignedTransaction } from './helpers/getSignedTransaction';

export const executeTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  const signedTransaction = getSignedTransaction(signerContext, task, key);

  const result = await signerContext.client.sendSignedTransaction({
    signedTransaction,
  });

  // if success - call resolver
  signerContext.resolver.completeTask(task.taskId, {
    result,
  });
};
