import { getKeyPriority } from './getKeyPriority';
import { createFindTaskForKey } from './createFindTaskForKey';
import type { TransactionIntent } from 'nat-types/transaction';

const createAddSignTransactionTask =
  (signerContext: any, state: any) =>
  (transactionIntent: TransactionIntent) => {
    const task = {
      type: 'SignTransaction',
      taskId: crypto.randomUUID(),
      keyPriority: getKeyPriority(transactionIntent),
      transactionIntent,
    };

    state.queue.push(task);
    signerContext.matcher.handleAddTask(task);

    return task.taskId;
  };

export const createTaskQueue = (signerContext: any) => {
  const state = {
    queue: [],
  };

  const removeTask = (taskId: any) => {
    state.queue = state.queue.filter((task: any) => task.taskId !== taskId);
  };

  return {
    addSignTransactionTask: createAddSignTransactionTask(signerContext, state),
    findTaskForKey: createFindTaskForKey(signerContext, state),
    removeTask,
  };
};
