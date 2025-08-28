import { getSignedTransaction } from './helpers/getSignedTransaction';
import type { SignerContext } from 'nat-types/signers/memorySigner';

export const executeTransaction = async (
  signerContext: SignerContext,
  task: any,
  key: any,
) => {
  const signedTransaction = getSignedTransaction(signerContext, task, key);

  return await signerContext.client.sendSignedTransaction({
    signedTransaction,
  });
};
