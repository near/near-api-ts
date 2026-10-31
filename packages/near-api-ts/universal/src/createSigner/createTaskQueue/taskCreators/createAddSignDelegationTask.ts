import type { CreateAddSignDelegationTask } from '../../../../types/signer/inner/taskQueue';
import { addTask } from './_common/addTask';
import { getAccessTypePriority } from './_common/getAccessTypePriority';

export const createAddSignDelegationTask: CreateAddSignDelegationTask =
  (taskQueueContext) => async (delegationIntent) => {
    const { keyPool, tasker } = taskQueueContext.signerContext;

    const task = {
      taskType: 'SignDelegation' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority({
        action: delegationIntent.delegatedAction,
        actions: delegationIntent.delegatedActions,
        receiverAccountId: delegationIntent.receiverAccountId,
      }),
      delegationIntent,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.success) return canHandle;

    addTask({ task, taskQueueContext });

    return await tasker.waitForTask(task.taskId);
  };
