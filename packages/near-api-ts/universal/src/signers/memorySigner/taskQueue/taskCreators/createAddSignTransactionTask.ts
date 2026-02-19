import type { CreateAddSignTransactionTask } from '@universal/types/signers/memorySigner/inner/taskQueue';
import { addTask } from './_common/addTask';
import { getAccessTypePriority } from './_common/getAccessTypePriority';

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
