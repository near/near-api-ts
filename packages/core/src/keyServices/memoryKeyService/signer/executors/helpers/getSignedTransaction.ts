import { getTransactionHash } from '../../../../../helpers/crypto/getTransactionHash';
import { sign } from '../../../../../helpers/crypto/sign';
import type { SignedTransaction } from 'nat-types/signedTransaction';

export const getSignedTransaction = (
  signerContext: any,
  task: any,
  key: any,
): SignedTransaction => {
  const transaction = {
    ...task.transactionIntent,
    signerAccountId: signerContext.signerAccountId,
    signerPublicKey: key.publicKey,
    nonce: key.nonce + 1,
    blockHash: signerContext.state.getBlockHash(),
  };

  const { transactionHash, u8TransactionHash } =
    getTransactionHash(transaction);

  const { signature } = sign({
    message: u8TransactionHash,
    privateKey: key.privateKey,
  });

  return {
    transaction,
    transactionHash,
    signature,
  };
};
