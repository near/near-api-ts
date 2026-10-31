import type {
  CreateTaskQueue,
  RemoveTask,
  TaskQueue,
  TaskQueueContext,
} from '../../../types/signer/inner/taskQueue';
import { createFindTaskForKey } from './createFindTaskForKey';
import { createAddExecuteTransactionTask } from './taskCreators/createAddExecuteTransactionTask';
import { createAddSignTransactionTask } from './taskCreators/createAddSignTransactionTask';

export const createTaskQueue: CreateTaskQueue = (signerContext, createSignerArgs): TaskQueue => {
  const taskQueueContext: TaskQueueContext = {
    queue: [],
    cleaners: {},
    signerContext,
    timeoutMs: createSignerArgs.taskQueue?.timeoutMs ?? 60_000,
  };

  // We remove the task from the queue when the task execution starts, it times out or its call
  // is aborted - whichever comes first
  const removeTask: RemoveTask = (taskId) => {
    if (!taskQueueContext.queue.some((task) => task.taskId === taskId)) return false;

    taskQueueContext.queue = taskQueueContext.queue.filter((task) => task.taskId !== taskId);
    taskQueueContext.cleaners[taskId]();
    delete taskQueueContext.cleaners[taskId];
    return true;
  };

  return {
    addSignTransactionTask: createAddSignTransactionTask(taskQueueContext),
    addExecuteTransactionTask: createAddExecuteTransactionTask(taskQueueContext),
    findTaskForKey: createFindTaskForKey(taskQueueContext),
    removeTask,
  };
};
