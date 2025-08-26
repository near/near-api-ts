import type { TransactionIntent } from 'nat-types/transaction';
import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';

export const signTransaction =
  (signerContext: any, state: any) =>
  async (transactionIntent: TransactionIntent) => {
    const task = {
      type: 'SignTransaction',
      taskId: crypto.randomUUID(),
      signingKeyPriority: getSigningKeyPriority(transactionIntent),
      transactionIntent,
    };

    signerContext.matcher.canHandleTaskInFuture(task);
    state.queue.push(task);

    queueMicrotask(() => {
      signerContext.matcher.handleAddTask(task);
    });

    return signerContext.resolver.waitForTask(task.taskId);
  };
