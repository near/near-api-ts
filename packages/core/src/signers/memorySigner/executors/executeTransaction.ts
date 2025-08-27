import { getSignedTransaction } from './helpers/getSignedTransaction';

export const executeTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  const signedTransaction = getSignedTransaction(signerContext, task, key);

  return await signerContext.client.sendSignedTransaction({
    signedTransaction,
  });
};
