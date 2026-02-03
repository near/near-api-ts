import { getAccessTypePriority } from './_common/getAccessTypePriority';
import type { CreateAddSignTransactionTask } from 'nat-types/signers/memorySigner/taskQueue';
import { addTask } from './_common/addTask';

export const createAddSignTransactionTask: CreateAddSignTransactionTask =
  (taskQueueContext) => async (transactionIntent) => {
    const { keyPool, tasker } = taskQueueContext.signerContext;

    const task = {
      taskType: 'SignTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.ok) return canHandle;

    addTask(task, taskQueueContext);

    // TODO Fix types
    return await tasker.waitForTask(task.taskId);
  };
