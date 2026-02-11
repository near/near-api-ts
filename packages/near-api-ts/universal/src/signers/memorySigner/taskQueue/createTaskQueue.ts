import { createFindTaskForKey } from './createFindTaskForKey';
import { createAddSignTransactionTask } from './taskCreators/createAddSignTransactionTask';
import { createAddExecuteTransactionTask } from './taskCreators/createAddExecuteTransactionTask';
import type {
  CreateTaskQueue,
  RemoveTask,
  TaskQueue,
  TaskQueueContext,
} from '../../../../types/signers/memorySigner/taskQueue';

export const createTaskQueue: CreateTaskQueue = (
  signerContext,
  createMemorySignerArgs,
): TaskQueue => {
  const taskQueueContext: TaskQueueContext = {
    queue: [],
    cleaners: {},
    signerContext,
    timeoutMs: createMemorySignerArgs.taskQueue?.timeoutMs ?? 60_000,
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
