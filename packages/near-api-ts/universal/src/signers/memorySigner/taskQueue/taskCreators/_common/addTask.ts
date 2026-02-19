import type { Task, TaskQueueContext } from '@universal/types/signers/memorySigner/inner/taskQueue';
import { createNatError } from '../../../../../_common/natError';
import { result } from '../../../../../_common/utils/result';

export const addTask = (task: Task, taskQueueContext: TaskQueueContext) => {
  const { timeoutMs, signerContext, cleaners } = taskQueueContext;

  taskQueueContext.queue.push(task);

  // Cancel the task if it wasn't started before the task timeout
  cleaners[task.taskId] = setTimeout(() => {
    taskQueueContext.queue = taskQueueContext.queue.filter(
      ({ taskId }) => taskId !== task.taskId,
    );
    delete cleaners[task.taskId];

    signerContext.tasker.completeTask(
      task.taskId,
      result.err(
        createNatError({
          kind: 'MemorySigner.TaskQueue.Timeout',
          context: { timeoutMs },
        }),
      ),
    );
  }, timeoutMs);

  void signerContext.tasker.executeTask(task);
};
