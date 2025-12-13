import { getSigningKeyPriority } from './helpers/getSigningKeyPriority';
import type { CreateAddSignTransactionTask } from 'nat-types/signers/memorySigner/taskQueue';

export const createAddSignTransactionTask: CreateAddSignTransactionTask =
  (context) => async (transactionIntent) => {
    const { matcher, resolver } = context.signerContext;

    const task = {
      taskType: 'SignTransaction' as const,
      taskId: crypto.randomUUID(),
      signingKeyPriority: getSigningKeyPriority(transactionIntent),
      transactionIntent,
    };

    const canHandle = matcher.canHandleTaskInFuture(task);
    if (!canHandle.ok) return canHandle;

    context.addTask(task);
    queueMicrotask(() => matcher.handleAddTask(task));

    return resolver.waitForTask(task.taskId);
  };
