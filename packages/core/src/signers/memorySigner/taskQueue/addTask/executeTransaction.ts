import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';

export const createExecuteTransaction =
  (context: any) => async (args: any) => {
    const { matcher, resolver } = context.signerContext;

    const transactionIntent = {
      receiverAccountId: args.receiverAccountId,
      action: args.action,
      actions: args.actions,
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
