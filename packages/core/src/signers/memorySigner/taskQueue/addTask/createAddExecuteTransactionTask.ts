import { getAccessTypePriority } from './helpers/getAccessTypePriority';
import type { CreateAddExecuteTransactionTask } from 'nat-types/signers/memorySigner/taskQueue';

export const createAddExecuteTransactionTask: CreateAddExecuteTransactionTask =
  (context) => async (transactionIntent) => {
    const { matcher, resolver } = context.signerContext;

    const task = {
      taskType: 'ExecuteTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = matcher.canHandleTaskInFuture(task);
    if (!canHandle.ok) return canHandle;

    context.addTask(task);
    queueMicrotask(() => matcher.handleAddTask(task));

    // TODO Fix types
    return await resolver.waitForTask(task.taskId);
  };
