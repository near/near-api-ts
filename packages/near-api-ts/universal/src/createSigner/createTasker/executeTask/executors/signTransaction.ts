import type { Result } from '../../../../../types/_common/common';
import type { SignTransactionOutput } from '../../../../../types/_common/transaction/signTransaction';
import type { Transaction } from '../../../../../types/_common/transaction/transaction';
import type { PoolKey } from '../../../../../types/signer/inner/keyPool';
import type { Task } from '../../../../../types/signer/inner/taskQueue';
import type { SignerContext } from '../../../../../types/signer/signer';
import type { NatError } from '../../../../_common/_common/_common/_common/natError';
import { result, resultNatError } from '../../../../_common/_common/_common/result';
import { wrapInternalError } from '../../../../_common/_common/wrapInternalError';

type Execute = () => Promise<
  Result<SignTransactionOutput, NatError<'Signer.SignTransaction.Internal'>>
>;

export const signTransaction = async (
  signerContext: SignerContext,
  task: Task,
  key: PoolKey,
): Promise<void> => {
  const execute: Execute = wrapInternalError('Signer.SignTransaction.Internal', async () => {
    const nextNonce = key.nonce + 1;
    const blockHash = await signerContext.client.safeGetRecentBlockHash();

    // TODO The signer has no error of its own for a failed request yet, so it is Internal for now
    if (!blockHash.success)
      return resultNatError('Signer.SignTransaction.Internal', { cause: blockHash.error });

    const transaction: Transaction = {
      ...task.transactionIntent,
      signer: {
        accountId: signerContext.signerAccountId,
        publicKey: key.publicKey,
        replayProtection: { scheme: 'NonceChannel', nonce: nextNonce },
      },
      recentBlockHash: blockHash.data,
    };

    const signedTransaction = await signerContext.signService.safeSignTransaction({ transaction });

    // TODO A key deleted from the vault fails here - to be solved by syncing the vault
    //  and the signer; until then the failure is reported as Internal
    if (!signedTransaction.success)
      return resultNatError('Signer.SignTransaction.Internal', { cause: signedTransaction.error });

    key.setNonce(nextNonce);
    return result.ok(signedTransaction.data);
  });

  const transactionResult = await execute();
  signerContext.tasker.completeTask(task.taskId, transactionResult);
};
