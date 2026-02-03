import { getAccessTypePriority } from './helpers/getAccessTypePriority';
import type { CreateAddSignTransactionTask } from 'nat-types/signers/memorySigner/taskQueue';

export const createAddSignTransactionTask: CreateAddSignTransactionTask =
  (context) => async (transactionIntent) => {
    const { matcher, keyPool, resolver } = context.signerContext;

    const task = {
      taskType: 'SignTransaction' as const,
      taskId: crypto.randomUUID(),
      accessTypePriority: getAccessTypePriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = await keyPool.isKeyForTaskExist(task);
    if (!canHandle.ok) return canHandle;

    context.addTask(task);
    queueMicrotask(() => matcher.handleAddTask(task));

    // TODO Fix types
    return await resolver.waitForTask(task.taskId);
  };
