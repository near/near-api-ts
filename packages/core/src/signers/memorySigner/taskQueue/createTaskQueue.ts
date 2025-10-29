import { createFindTaskForKey } from './createFindTaskForKey';
import { createSignTransaction } from './addTask/createSignTransaction';
import { createExecuteTransaction } from './addTask/createExecuteTransaction';
import { createSignMultipleTransactions } from './addTask/createSignMultipleTransactions';
import { createExecuteMultipleTransactions } from './addTask/createExecuteMultipleTransactions';
import type { SignerContext } from 'nat-types/signers/memorySigner';
import type {
  RemoveTask,
  TaskQueue,
  TaskQueueContext,
} from 'nat-types/signers/taskQueue';

export const createTaskQueue = (signerContext: SignerContext): TaskQueue => {
  const context: TaskQueueContext = {
    queue: [],
    cleaners: {},
    signerContext,
    addTask: (_) => {},
    removeTask: (_) => {},
  };

  context.addTask = (task) => {
    context.queue.push(task);
    // Cancel the task if it wasn't started during queueTimeout time
    context.cleaners[task.taskId] = setTimeout(() => {
      context.queue = context.queue.filter(
        ({ taskId }) => taskId !== task.taskId,
      );
      delete context.cleaners[task.taskId];

      context.signerContext.resolver.completeTask(task.taskId, {
        error: 'Task execution was rejected after timeout', // TODO use new Error?
      });
    }, context.signerContext.taskTtlMs);
  };

  // We remove the task from the queue when the task execution starts
  const removeTask: RemoveTask = (taskId) => {
    context.queue = context.queue.filter((task) => task.taskId !== taskId);
    clearTimeout(context.cleaners[taskId]);
    delete context.cleaners[taskId];
  };

  return {
    signTransaction: createSignTransaction(context),
    signMultipleTransactions: createSignMultipleTransactions(context),
    executeTransaction: createExecuteTransaction(context),
    executeMultipleTransactions: createExecuteMultipleTransactions(context),
    findTaskForKey: createFindTaskForKey(context),
    removeTask,
  };
};
