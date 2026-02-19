import type { Result } from '@universal/types/_common/common';
import type { ActiveTasks, CompleteTask, CreateTasker, WaitForTask } from '@universal/types/signers/memorySigner/inner/tasker';
import type { TaskId } from '@universal/types/signers/memorySigner/inner/taskQueue';
import { createExecuteTask } from './executeTask/executeTask';

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
