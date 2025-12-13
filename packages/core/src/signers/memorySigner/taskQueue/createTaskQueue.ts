import { createFindTaskForKey } from './createFindTaskForKey';
import { createAddSignTransactionTask } from './addTask/createAddSignTransactionTask';
import { createAddExecuteTransactionTask } from './addTask/createAddExecuteTransactionTask';
import { result } from '@common/utils/result';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type {
  RemoveTask,
  TaskQueue,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';
import { createNatError } from '@common/natError';

export const createTaskQueue = (
  signerContext: MemorySignerContext,
): TaskQueue => {
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

      context.signerContext.resolver.completeTask(
        task.taskId,
        result.err(
          createNatError({
            kind: 'MemorySigner.TaskQueue.Task.MaxTimeInQueueReached',
            context: {
              task,
              maxWaitInQueueMs: context.signerContext.maxWaitInQueueMs,
            },
          }),
        ),
      );
    }, context.signerContext.maxWaitInQueueMs);
  };

  // We remove the task from the queue when the task execution starts
  const removeTask: RemoveTask = (taskId) => {
    context.queue = context.queue.filter((task) => task.taskId !== taskId);
    clearTimeout(context.cleaners[taskId]);
    delete context.cleaners[taskId];
  };

  return {
    addSignTransactionTask: createAddSignTransactionTask(context),
    addExecuteTransactionTask: createAddExecuteTransactionTask(context),
    findTaskForKey: createFindTaskForKey(context),
    removeTask,
  };
};
