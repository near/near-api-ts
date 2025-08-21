import type { TransactionIntent } from 'nat-types/transaction';
import { getKeyPriority } from './getKeyPriority';

export const createAddSignTransactionTask =
  (signerContext: any, state: any) =>
  (transactionIntent: TransactionIntent) => {
    const task = {
      type: 'SignTransaction',
      taskId: crypto.randomUUID(),
      keyPriority: getKeyPriority(transactionIntent),
      transactionIntent,
    };

    state.queue.push(task);

    queueMicrotask(() => {
      signerContext.matcher.handleAddTask(task);
    });

    return task.taskId;
  };
