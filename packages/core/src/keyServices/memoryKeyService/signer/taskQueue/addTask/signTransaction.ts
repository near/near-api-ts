import type { TransactionIntent } from 'nat-types/transaction';
import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';

export const createSignTransaction =
  (context: any) => async (transactionIntent: TransactionIntent) => {
    const { matcher, resolver } = context.signerContext;

    const task = {
      type: 'SignTransaction',
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
