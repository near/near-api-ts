import { signTransaction } from './executors/signTransaction';
import { executeTransaction } from './executors/executeTransaction';
import type {
  CreateExecuteTask,
  ExecuteTask,
} from 'nat-types/signers/memorySigner/tasker';

export const createExecuteTask: CreateExecuteTask = (signerContext) => {
  const executeTask: ExecuteTask = async (task, key) => {
    key.lock();
    signerContext.taskQueue.removeTask(task.taskId);

    const tasker =
      task.taskType === 'ExecuteTransaction'
        ? executeTransaction
        : signTransaction;

    await tasker(signerContext, task, key);
    key.unlock();

    const nextTask = signerContext.taskQueue.findTaskForKey(key);
    if (nextTask) void executeTask(nextTask, key);
  };

  return executeTask;
};
