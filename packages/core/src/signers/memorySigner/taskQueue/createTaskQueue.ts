import { createFindTaskForKey } from './createFindTaskForKey';
import { createSignTransaction } from './addTask/signTransaction';
import { createExecuteTransaction } from './addTask/executeTransaction';
import { createSignMultipleTransactions } from './addTask/signMultipleTransactions';
import { createExecuteMultipleTransactions } from './addTask/executeMultipleTransactions';
import type { SignerContext } from 'nat-types/signers/memorySigner';

export const createTaskQueue = (signerContext: SignerContext) => {
  const context: any = {
    queue: [],
    cleaners: {},
    signerContext,
  };

  context.addTask = (task: any) => {
    context.queue.push(task);
    // Cancel the task if it wasn't started during queueTimeout time
    context.cleaners[task.taskId] = setTimeout(() => {
      context.queue = context.queue.filter(
        ({ taskId }: any) => taskId !== task.taskId,
      );
      delete context.cleaners[task.taskId];

      context.signerContext.resolver.completeTask(task.taskId, {
        error: 'Task execution was rejected after timeout',
      });
    }, context.signerContext.taskTtlMs);
  };

  // We remove the task from the queue when the task execution starts
  const removeTask = (taskId: any) => {
    context.queue = context.queue.filter((task: any) => task.taskId !== taskId);
    clearTimeout(context.cleaners[taskId]);
    delete context.cleaners[taskId];
  };

  return {
    signTransaction: createSignTransaction(context),
    signMultipleTransactions: createSignMultipleTransactions(context),
    executeTransaction: createExecuteTransaction(context),
    executeeMultipleTransactions: createExecuteMultipleTransactions(context),
    findTaskForKey: createFindTaskForKey(context),
    removeTask,
  };
};
