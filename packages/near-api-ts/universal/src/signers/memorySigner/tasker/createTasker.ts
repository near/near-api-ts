import type { CreateTasker } from '../../../../types/signers/memorySigner/inner/tasker';
import { createExecuteTask } from './executeTask/executeTask';
import type {
  ActiveTasks,
  CompleteTask,
  WaitForTask,
} from '../../../../types/signers/memorySigner/inner/tasker';
import type { TaskId } from '../../../../types/signers/memorySigner/inner/taskQueue';
import type { Result } from '../../../../types/_common/common';

export const createTasker: CreateTasker = (signerContext) => {
  const activeTasks: ActiveTasks = {};

  // It returns Promise which callback will resolve, stored in the state
  const waitForTask: WaitForTask = <T, E>(
    taskId: TaskId,
  ): Promise<Result<T, E>> =>
    new Promise((resolve) => {
      activeTasks[taskId] = (taskResult: Result<T, E>) => {
        resolve(taskResult);
        delete activeTasks[taskId];
      };
    });

  const completeTask: CompleteTask = (taskId, taskResult) => {
    activeTasks[taskId](taskResult);
  };

  return {
    executeTask: createExecuteTask(signerContext),
    waitForTask,
    completeTask,
  };
};
