import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';
import type {
  Task,
  TaskQueueContext,
} from 'nat-types/signers/memorySigner/taskQueue';

export const addTask = (task: Task, taskQueueContext: TaskQueueContext) => {
  const { timeoutMs, signerContext, cleaners } = taskQueueContext;

  taskQueueContext.queue.push(task);

  // Cancel the task if it wasn't started during queueTimeout time
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

  // We want to execute the task later - right now we need to return a promise;
  queueMicrotask(async () => {
    const key = await signerContext.keyPool.findKeyForTask(task);
    // Should never happen, because we check it before adding a task to the queue
    if (!key.ok) throw key;
    // If some key is available (doesn't perform any task now) - execute the task immediately;
    // If not - wait for some key to be unlocked and then execute the task;
    if (key.value) void signerContext.tasker.executeTask(task, key.value);
  });
};
