import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';

export const createExecuteTransaction =
  (context: any) => async (params: any) => {
    const { matcher, resolver } = context.signerContext;

    const transactionIntent = {
      receiverAccountId: params.receiverAccountId,
      action: params.action,
      actions: params.actions,
    };

    const task = {
      type: 'ExecuteTransaction',
      taskId: crypto.randomUUID(),
      signingKeyPriority: getSigningKeyPriority(transactionIntent),
      transactionIntent,
    };

    matcher.canHandleTaskInFuture(task);
    context.addTask(task);

    queueMicrotask(() => {
      matcher.handleAddTask(task);
    });

    return resolver.waitForTask(task.taskId);
  };
