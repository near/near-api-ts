import type { Result } from '../../../_common/common';
import type { MemorySignerContext } from '../memorySigner';
import type { Task, TaskId } from './taskQueue';

export type ActiveTasks = Record<
  TaskId,
  (taskResult: Result<any, any>) => void // TODO Fix any
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
