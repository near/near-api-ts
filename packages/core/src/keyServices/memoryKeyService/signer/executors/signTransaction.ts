import { getTransactionHash } from '../../../../helpers/crypto/getTransactionHash';
import { sign } from '../../../../helpers/crypto/sign';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const signTransaction = async (
  signerContext: any,
  task: any,
  key: any,
) => {
  await delay(500);

  const transaction = {
    ...task.transactionIntent,
    signerAccountId: signerContext.signerAccountId,
    signerPublicKey: key.publicKey,
    nonce: key.nonce + 1,
    blockHash: signerContext.blockHashManager.getBlockHash(),
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

  console.log('-----------------');
  console.log('Finish sign TX', task.taskId);
  // if success - call resolver

  signerContext.resolver.completeTask(task.taskId, {
    result: signedTransaction,
  });
};
