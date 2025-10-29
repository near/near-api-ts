import { signTransaction } from '../executors/signTransaction';
import { executeTransaction } from '../executors/executeTransaction';
import type { Task } from 'nat-types/signers/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/keyPool';
import type { SignerContext } from 'nat-types/signers/memorySigner';

const execute = (task: Task) => {
  if (task.type === 'SignTransaction') return signTransaction;
  if (task.type === 'ExecuteTransaction') return executeTransaction;
  throw new Error('Unsupported task type');
};

const executeTask = async (
  signerContext: SignerContext,
  task: Task,
  key: KeyPoolKey,
) => {
  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  await execute(task)(signerContext, task, key);

  key.unlock();
  void signerContext.matcher.handleKeyUnlock(key);
};

export const createMatcher = (signerContext: SignerContext) => {
  const handleAddTask = async (task: Task) => {
    const key = signerContext.keyPool.findKeyForTask(task);
    if (key) void executeTask(signerContext, task, key);
  };

  const handleKeyUnlock = async (key: KeyPoolKey) => {
    const task = signerContext.taskQueue.findTaskForKey(key);
    if (task) void executeTask(signerContext, task, key);
  };

  const canHandleTaskInFuture = (task: Task) => {
    const canHandle = signerContext.keyPool.isKeyForTaskExist(task);
    if (!canHandle) throw new Error(`There is no key, which can sigh the task`);
  };

  return {
    handleAddTask,
    handleKeyUnlock,
    canHandleTaskInFuture,
  };
};
