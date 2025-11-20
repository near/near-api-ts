import type { TaskId } from 'nat-types/signers/memorySigner/taskQueue';
import type { Result } from 'nat-types/common';

export type ActiveTasks = Record<
  TaskId,
  // <T, E>(taskResult: Result<T, E>) => void
  (taskResult: Result<any, any>) => void // TODO Fix it
>;

export type WaitForTask = <T, E>(taskId: TaskId) => Promise<Result<T, E>>;

export type CompleteTask = <T, E>(
  taskId: TaskId,
  taskResult: Result<T, E>,
) => void;

export type Resolver = {
  waitForTask: WaitForTask;
  completeTask: CompleteTask;
};
