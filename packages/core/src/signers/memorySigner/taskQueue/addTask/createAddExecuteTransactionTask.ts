import { getAccessTypePriority } from './helpers/getAccessTypePriority';
import type {
  AddExecuteTransactionTask,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';

export const createAddExecuteTransactionTask =
  (context: TaskQueueContext): AddExecuteTransactionTask =>
  async (transactionIntent) => {
    const { matcher, resolver } = context.signerContext;

    const task = {
      taskType: 'ExecuteTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = matcher.canHandleTaskInFuture(task);
    if (!canHandle.ok) return canHandle;

    queueMicrotask(() => {
      matcher.handleAddTask(task);
    });

    return resolver.waitForTask(task.taskId);
  };
