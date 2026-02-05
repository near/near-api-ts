import type { Task, TaskId } from 'nat-types/signers/memorySigner/taskQueue';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { Result } from 'nat-types/_common/common';

export type ActiveTasks = Record<
  TaskId,
  (taskResult: Result<any, any>) => void // TODO Fix it
>;

// TODO Fix types
export type WaitForTask = <T, E>(taskId: TaskId) => Promise<Result<T, E>>;

export type CompleteTask = <T, E>(
  taskId: TaskId,
  taskResult: Result<T, E>,
) => void;

export type ExecuteTask = (task: Task) => Promise<void>;

export type CreateExecuteTask = (
  signerContext: MemorySignerContext,
) => ExecuteTask;

export type Tasker = {
  executeTask: ExecuteTask;
  waitForTask: WaitForTask;
  completeTask: CompleteTask;
};

export type CreateTasker = (context: MemorySignerContext) => Tasker;
