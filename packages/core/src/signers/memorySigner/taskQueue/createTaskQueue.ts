import { createFindTaskForKey } from './createFindTaskForKey';
import { createAddSignTransactionTask } from './addTask/createAddSignTransactionTask';
import { createAddExecuteTransactionTask } from './addTask/createAddExecuteTransactionTask';
import { result } from '@common/utils/result';
import type {
  CreateTaskQueue,
  RemoveTask,
  TaskQueue,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';
import { createNatError } from '@common/natError';

export const createTaskQueue: CreateTaskQueue = (
  signerContext,
  createMemorySignerArgs,
): TaskQueue => {
  const taskQueueContext: TaskQueueContext = {
    queue: [],
    cleaners: {},
    signerContext,
    addTask: (_) => {},
    removeTask: (_) => {},
  };

  taskQueueContext.addTask = (task) => {
    taskQueueContext.queue.push(task);

    const timeoutMs =
      createMemorySignerArgs.taskQueue?.timeoutMs ?? 60_000; // 1 min

    // Cancel the task if it wasn't started during queueTimeout time
    taskQueueContext.cleaners[task.taskId] = setTimeout(() => {
      taskQueueContext.queue = taskQueueContext.queue.filter(
        ({ taskId }) => taskId !== task.taskId,
      );
      delete taskQueueContext.cleaners[task.taskId];

      taskQueueContext.signerContext.resolver.completeTask(
        task.taskId,
        result.err(
          createNatError({
            kind: 'MemorySigner.TaskQueue.Timeout',
            context: { timeoutMs },
          }),
        ),
      );
    }, timeoutMs);
  };

  // We remove the task from the queue when the task execution starts
  const removeTask: RemoveTask = (taskId) => {
    taskQueueContext.queue = taskQueueContext.queue.filter(
      (task) => task.taskId !== taskId,
    );
    clearTimeout(taskQueueContext.cleaners[taskId]);
    delete taskQueueContext.cleaners[taskId];
  };

  return {
    addSignTransactionTask: createAddSignTransactionTask(taskQueueContext),
    addExecuteTransactionTask:
      createAddExecuteTransactionTask(taskQueueContext),
    findTaskForKey: createFindTaskForKey(taskQueueContext),
    removeTask,
  };
};
