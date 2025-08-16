import { getTransactionHash } from '../../../../helpers/crypto/getTransactionHash';
import { sign } from '../../../../helpers/crypto/sign';

export const signTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  // TODO Figure out how to cache blockHash and avoid requests;
  const { blockHash } = await signerContext.client.getAccountKey({
    accountId: signerContext.signerAccountId,
    publicKey: key.publicKey,
  });

  const transaction = {
    ...task.transactionIntent,
    signerAccountId: signerContext.signerAccountId,
    signerPublicKey: key.publicKey,
    nonce: key.nonce + 1,
    blockHash,
  };

  const { transactionHash, u8TransactionHash } =
    getTransactionHash(transaction);

  const { signature } = sign({
    message: u8TransactionHash,
    privateKey: key.privateKey,
  });

  const signedTransaction = {
    transaction,
    transactionHash,
    signature,
  };

  // if success - call resolver
  signerContext.resolver.completeTask(task.taskId, {
    result: signedTransaction,
  });
};
