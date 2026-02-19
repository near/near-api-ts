import type { CreateAddExecuteTransactionTask } from '@universal/types/signers/memorySigner/inner/taskQueue';
import { addTask } from './_common/addTask';
import { getAccessTypePriority } from './_common/getAccessTypePriority';

export const createAddExecuteTransactionTask: CreateAddExecuteTransactionTask =
  (taskQueueContext) => async (transactionIntent) => {
    const { keyPool, tasker } = taskQueueContext.signerContext;

    const task = {
      taskType: 'ExecuteTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.ok) return canHandle;

    addTask(task, taskQueueContext);

    return await tasker.waitForTask(task.taskId);
  };
