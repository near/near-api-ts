import { getTransactionHash } from '../../../../helpers/crypto/getTransactionHash';
import { sign } from '../../../../helpers/crypto/sign';
import type { SignedTransaction } from 'nat-types/signedTransaction';
import type { Nonce } from 'nat-types/common';
import type { SignerContext } from 'nat-types/signers/memorySigner';
import type { Task } from 'nat-types/signers/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/keyPool';
import type { Transaction } from 'nat-types/transaction';

export const getSignedTransaction = (
  signerContext: SignerContext,
  task: Task,
  key: KeyPoolKey,
  nextNonce: Nonce,
): SignedTransaction => {
  const transaction: Transaction = {
    ...task.transactionIntent,
    signerAccountId: signerContext.signerAccountId,
    signerPublicKey: key.publicKey,
    nonce: nextNonce,
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
