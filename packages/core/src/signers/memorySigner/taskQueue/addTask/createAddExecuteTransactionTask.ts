import { getAccessTypePriority } from './helpers/getAccessTypePriority';
import type { CreateAddExecuteTransactionTask } from 'nat-types/signers/memorySigner/taskQueue';

export const createAddExecuteTransactionTask: CreateAddExecuteTransactionTask =
  (taskQueueContext) => async (transactionIntent) => {
    const { matcher, keyPool, resolver } = taskQueueContext.signerContext;

    const task = {
      taskType: 'ExecuteTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.ok) return canHandle;

    taskQueueContext.addTask(task);
    queueMicrotask(() => matcher.handleAddTask(task));

    // TODO Fix types
    return await resolver.waitForTask(task.taskId);
  };
