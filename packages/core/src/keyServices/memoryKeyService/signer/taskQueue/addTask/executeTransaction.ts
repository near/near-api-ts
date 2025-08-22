import { getKeyPriority } from '../getKeyPriority';

export const executeTransaction =
  (signerContext: any, state: any) => async (params: any) => {
    const transactionIntent = {
      receiverAccountId: params.receiverAccountId,
      action: params.action,
      actions: params.actions,
    };

    const task = {
      type: 'ExecuteTransaction',
      taskId: crypto.randomUUID(),
      keyPriority: getKeyPriority(transactionIntent),
      transactionIntent,
    };

    state.queue.push(task);

    queueMicrotask(() => {
      signerContext.matcher.handleAddTask(task);
    });

    return signerContext.resolver.waitForTask(task.taskId);
  };
