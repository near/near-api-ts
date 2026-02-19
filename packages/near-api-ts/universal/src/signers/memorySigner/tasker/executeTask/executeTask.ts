import { signTransaction } from './executors/signTransaction';
import { executeTransaction } from './executors/executeTransaction';
import type {
  CreateExecuteTask,
  ExecuteTask,
} from '../../../../../types/signers/memorySigner/inner/tasker';

export const createExecuteTask: CreateExecuteTask = (signerContext) => {
  const executeTask: ExecuteTask = async (task) => {
    // Try to find an available key for the task;
    // It should definitely exist, because we check it before adding a task to the queue;
    // But it's possible that there is no available key at the moment, as all
    // of them execute the task right now, so we need to wait for a while;
    const maybeKey = await signerContext.keyPool.findKeyForTask(task);

    // This should never happen, because we check poolKeys before adding a task to the queue;
    // Will be thrown only if there is a bug in the code; Consider as Internal error;
    if (!maybeKey.ok) throw maybeKey;

    // If any key is available (doesn't perform any task now) - execute the task;
    // If not - skip the task and wait for the next key to become available;
    if (!maybeKey.value) return;

    const key = maybeKey.value;
    signerContext.taskQueue.removeTask(task.taskId);

    const execute =
      task.taskType === 'ExecuteTransaction'
        ? executeTransaction
        : signTransaction;

    // Execute the task; It will resolve the promise we returned to the task creator;
    await execute(signerContext, task, key);

    // Unlock the key so it can be used for the next task;
    key.unlock();

    const nextTask = signerContext.taskQueue.findTaskForKey(key);
    if (nextTask) void executeTask(nextTask);
  };

  return executeTask;
};
