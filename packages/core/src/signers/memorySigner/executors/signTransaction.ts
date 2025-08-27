import { getSignedTransaction } from './helpers/getSignedTransaction';

export const signTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  return  getSignedTransaction(signerContext, task, key);
};
