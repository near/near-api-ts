import type { TaskId } from 'nat-types/signers/memorySigner/taskQueue';
import type { Result } from 'nat-types/common';

export type ActiveTasks = Record<
  TaskId,
  <R, E>(taskResult: Result<R, E>) => void
>;

export type WaitForTask = <R>(taskId: TaskId) => Promise<R>;

export type CompleteTask = <R, E>(taskId: TaskId, taskResult: Result<R, E>) => void;

export type Resolver = {
  waitForTask: WaitForTask;
  completeTask: CompleteTask;
};
