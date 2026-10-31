import type { Task, TaskQueueContext } from '../../../../../types/signer/inner/taskQueue';
import {
  createNatError,
  type NatError,
} from '../../../../_common/_common/_common/_common/natError';
import { result } from '../../../../_common/_common/_common/result';

type AddTaskArgs = {
  task: Task;
  // The signal of the call that added the task, if it takes one
  signal?: AbortSignal;
  taskQueueContext: TaskQueueContext;
};

export const addTask = ({ task, signal, taskQueueContext }: AddTaskArgs) => {
  const { timeoutMs, signerContext, cleaners } = taskQueueContext;

  taskQueueContext.queue.push(task);

  // Cancel the task if it wasn't started before the task timeout, or its call was aborted
  const cancelTask = (error: NatError<'Signer.TaskQueue.Timeout'> | NatError<'Signer.Aborted'>) => {
    if (signerContext.taskQueue.removeTask(task.taskId))
      signerContext.tasker.completeTask(task.taskId, result.err(error));
  };

  const timeoutId = setTimeout(
    () => cancelTask(createNatError({ kind: 'Signer.TaskQueue.Timeout', context: { timeoutMs } })),
    timeoutMs,
  );

  const onAbort = () =>
    cancelTask(createNatError({ kind: 'Signer.Aborted', context: { reason: signal?.reason } }));

  signal?.addEventListener('abort', onAbort, { once: true });

  cleaners[task.taskId] = () => {
    clearTimeout(timeoutId);
    signal?.removeEventListener('abort', onAbort);
  };

  void signerContext.tasker.executeTask(task);
};
