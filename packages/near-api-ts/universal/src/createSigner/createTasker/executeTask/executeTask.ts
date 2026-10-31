import type { CreateExecuteTask, ExecuteTask } from '../../../../types/signer/inner/tasker';
import { executeTransaction } from './executors/executeTransaction';
import { signTransaction } from './executors/signTransaction';

export const createExecuteTask: CreateExecuteTask = (signerContext) => {
  const executeTask: ExecuteTask = async (task) => {
    // Try to find an available key for the task;
    // It should definitely exist, because we check it before adding a task to the queue;
    // But it's possible that there is no available key at the moment, as all
    // of them execute the task right now, so we need to wait for a while;
    const maybeKey = await signerContext.keyPool.findKeyForTask(task);

    // This should never happen, because we check poolKeys before adding a task to the queue;
    // Will be thrown only if there is a bug in the code; Consider as Internal error;
    if (!maybeKey.success) throw maybeKey;

    // If any key is available (doesn't perform any task now) - execute the task;
    // If not - skip the task and wait for the next key to become available;
    if (maybeKey.data === undefined) return;

    const key = maybeKey.data;

    // The task may have left the queue while we were looking for a key: it timed out, its call
    // was aborted, or another key took it. Then the key just goes on to the next task;
    if (signerContext.taskQueue.removeTask(task.taskId)) {
      // Execute the task; It will resolve the promise we returned to the task creator;
      if (task.taskType === 'ExecuteTransaction')
        await executeTransaction(signerContext, task, key);
      else await signTransaction(signerContext, task, key);
    }

    // Unlock the key so it can be used for the next task;
    key.unlock();

    const nextTask = signerContext.taskQueue.findTaskForKey(key);
    if (nextTask) void executeTask(nextTask);
  };

  return executeTask;
};
