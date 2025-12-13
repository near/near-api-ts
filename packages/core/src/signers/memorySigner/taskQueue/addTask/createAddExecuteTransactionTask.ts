import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';
import type {
  AddExecuteTransactionTask,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';
import type { TransactionIntent } from 'nat-types/transaction';

export const createAddExecuteTransactionTask =
  (context: TaskQueueContext): AddExecuteTransactionTask =>
  async (args) => {
    const { matcher, resolver } = context.signerContext;

    const transactionIntent: TransactionIntent =
      args.action !== undefined
        ? {
            receiverAccountId: args.receiverAccountId,
            action: args.action,
          }
        : {
            receiverAccountId: args.receiverAccountId,
            actions: args.actions,
          };

    const task = {
      taskType: 'ExecuteTransaction' as const,
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
