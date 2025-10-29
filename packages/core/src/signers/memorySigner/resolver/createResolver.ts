import type { TaskId } from 'nat-types/signers/memorySigner/taskQueue';
import type {
  ActiveTasks,
  CompleteTask,
  Resolver,
  WaitForTask,
} from 'nat-types/signers/memorySigner/resolver';

export const createResolver = (): Resolver => {
  const activeTasks: ActiveTasks = {};

  // Return Promise which will be resolved by callback, stored in the state
  const waitForTask: WaitForTask = <R>(taskId: TaskId): Promise<R> =>
    new Promise((resolve, reject) => {
      activeTasks[taskId] = (taskResult) => {
        'result' in taskResult
          ? resolve(taskResult.result as R)
          : reject(taskResult.error);

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
