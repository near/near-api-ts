import type { TaskId } from 'nat-types/signers/memorySigner/taskQueue';
import type {
  ActiveTasks,
  CompleteTask,
  Resolver,
  WaitForTask,
} from 'nat-types/signers/memorySigner/resolver';
import type { Result } from 'nat-types/common';

export const createResolver = (): Resolver => {
  const activeTasks: ActiveTasks = {};

  // Return Promise which will be resolved by callback, stored in the state
  const waitForTask: WaitForTask = <T, E>(
    taskId: TaskId,
  ): Promise<Result<T, E>> =>
    new Promise((resolve, reject) => {
      activeTasks[taskId] = (taskResult: Result<T, E>) => {
        taskResult.ok ? resolve(taskResult) : reject(taskResult);
        delete activeTasks[taskId];
      };
    });

  const completeTask: CompleteTask = (taskId, taskResult) => {
    activeTasks[taskId](taskResult);
  };

  return {
    waitForTask,
    completeTask,
  };
};
