import { getSignedTransaction } from './helpers/getSignedTransaction';
import type { RpcError } from '@near-js/jsonrpc-types';
// import type { SignerContext } from 'nat-types/signers/memorySigner';

/*
const err = {
  name: 'HANDLER_ERROR',
  cause: { info: {}, name: 'INVALID_TRANSACTION' },
  code: -32000,
  message: 'Server error',
  data: {
    TxExecutionError: {
      InvalidTxError: {
        InvalidNonce: {
          ak_nonce: 210072560000031,
          tx_nonce: 210072560000031,
        },
      },
    },
  },
};
 */

const isInvalidNonceError = (error: any) =>
  error.name === 'HANDLER_ERROR' &&
  error?.data?.TxExecutionError?.InvalidTxError?.InvalidNonce;

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
