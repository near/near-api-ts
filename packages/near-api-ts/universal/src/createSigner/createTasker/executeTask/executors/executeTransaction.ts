import type { Result, TransactionNonce } from '../../../../../types/_common/common';
import type { Transaction } from '../../../../../types/_common/transaction/transaction';
import type { SendSignedTransactionOutput } from '../../../../../types/client/methods/transaction/sendSignedTransaction/output';
import type { PoolKey } from '../../../../../types/signer/inner/keyPool';
import type { Task } from '../../../../../types/signer/inner/taskQueue';
import type { SignerContext } from '../../../../../types/signer/signer';
import {
  createNatError,
  type NatError,
} from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';

type Attempt = (
  attemptIndex: number,
  newNonce: TransactionNonce,
) => Promise<
  Result<
    SendSignedTransactionOutput,
    | NatError<'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction'>
    | NatError<'Signer.ExecuteTransaction.Internal'>
  >
>;

export const executeTransaction = async (
  signerContext: SignerContext,
  task: Task,
  key: PoolKey,
): Promise<void> => {
  const maxAttempts = 3; // Maybe we will allow user to configure it in the future

  const attempt: Attempt = wrapInternalError(
    'Signer.ExecuteTransaction.Internal',
    async (attemptIndex, newNonce) => {
      const blockHash = await signerContext.client.safeGetRecentBlockHash();

      // TODO The signer has no error of its own for a failed request yet, so it is Internal for now
      if (!blockHash.success)
        return resultNatError('Signer.ExecuteTransaction.Internal', { cause: blockHash.error });

      const transaction: Transaction = {
        ...task.transactionIntent,
        signer: {
          accountId: signerContext.signerAccountId,
          publicKey: key.publicKey,
          replayProtection: { scheme: 'NonceChannel', nonce: newNonce },
        },
        recentBlockHash: blockHash.data,
      };

      const signedTransaction = await signerContext.signService.safeSignTransaction({
        transaction,
      });

      // TODO A key deleted from the vault fails here - to be solved by syncing the vault
      //  and the signer; until then the failure is reported as Internal
      if (!signedTransaction.success)
        return resultNatError('Signer.ExecuteTransaction.Internal', {
          cause: signedTransaction.error,
        });

      const txResult = await signerContext.client.safeSendSignedTransaction({
        signedTransaction: signedTransaction.data,
      });

      // If tx executed successfully, update key nonce and return tx execution result;
      if (txResult.success) {
        key.setNonce(newNonce);
        return txResult;
      }

      // If it's not a last attempt + it's a nonce error -
      // re-sign with the new nonce and try to send it again;
      if (
        attemptIndex <= maxAttempts &&
        txResult.error.kind === 'Client.SendSignedTransaction.Rpc.Nonce.Invalid'
      ) {
        return await attempt(attemptIndex + 1, txResult.error.context.info.accessKeyNonce + 1);
      }

      // Pack sendSignedTransaction error and return;
      return result.err(
        createNatError({
          kind: 'Signer.Executors.ExecuteTransaction.Client.SendSignedTransaction',
          context: { cause: txResult.error },
        }),
      );
    },
  );

  const executeTransactionResult = await attempt(1, key.nonce + 1);

  signerContext.tasker.completeTask(task.taskId, executeTransactionResult);
};
