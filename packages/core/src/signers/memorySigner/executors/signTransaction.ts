import { result } from '@common/utils/result';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { SignedTransaction, Transaction } from 'nat-types/transaction';
import { wrapInternalError } from '@common/utils/wrapInternalError';
import type { Result } from 'nat-types/_common/common';
import type { NatError } from '@common/natError';

type Execute = () => Promise<
  Result<SignedTransaction, NatError<'MemorySigner.SignTransaction.Internal'>>
>;

export const signTransaction = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: KeyPoolKey,
): Promise<void> => {
  const execute: Execute = wrapInternalError(
    'MemorySigner.SignTransaction.Internal',
    async () => {
      const nextNonce = key.nonce + 1;

      const transaction: Transaction = {
        ...task.transactionIntent,
        signerAccountId: signerContext.signerAccountId,
        signerPublicKey: key.publicKey,
        nonce: nextNonce,
        blockHash: signerContext.state.getBlockHash(),
      };

      // This call will never fail
      const signedTransaction = await signerContext.keyService.signTransaction({
        transaction,
      });

      key.setNonce(nextNonce);
      return result.ok(signedTransaction);
    },
  );

  const transactionResult = await execute();
  signerContext.resolver.completeTask(task.taskId, transactionResult);
};
