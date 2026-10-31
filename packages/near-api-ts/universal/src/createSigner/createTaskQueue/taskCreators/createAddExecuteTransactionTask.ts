import type { CreateAddExecuteTransactionTask } from '../../../../types/signer/inner/taskQueue';
import { resultNatError } from '../../../_common/_common/_common/result';
import { addTask } from './_common/addTask';
import { getAccessTypePriority } from './_common/getAccessTypePriority';

export const createAddExecuteTransactionTask: CreateAddExecuteTransactionTask =
  (taskQueueContext) =>
  async ({ transactionIntent, sendingArgs }) => {
    const { keyPool, tasker } = taskQueueContext.signerContext;

    const task = {
      taskType: 'ExecuteTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
      sendingArgs,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.success) return canHandle;

    // A call aborted by now doesn't get into the queue; one aborted there leaves it - see addTask
    const signal = sendingArgs.options?.signal;
    if (signal?.aborted) return resultNatError('Signer.Aborted', { reason: signal.reason });

    addTask({ task, signal, taskQueueContext });

    return await tasker.waitForTask(task.taskId);
  };
