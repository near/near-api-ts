import { signTransaction } from '../executors/signTransaction';
import { executeTransaction } from '../executors/executeTransaction';

const getExecutor = (task: any) => {
  if (task.type === 'SignTransaction') return signTransaction;
  if (task.type === 'ExecuteTransaction') return executeTransaction;
  throw new Error('Unsupported task type');
};

const executeTask = async (signerContext: any, task: any, key: any) => {
  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  const executor = getExecutor(task);
  const result = await executor(signerContext, task, key);

  key.incrementNonce();
  key.unlock();

  signerContext.resolver.completeTask(task.taskId, { result });
  void signerContext.matcher.handleKeyUnlock(key);
};

export const createMatcher = (signerContext: any) => {
  const handleAddTask = async (task: any) => {
    const key = signerContext.keyPool.findKeyForTask(task);
    if (key) void executeTask(signerContext, task, key);
  };

  const handleKeyUnlock = async (key: any) => {
    const task = signerContext.taskQueue.findTaskForKey(key);
    if (task) void executeTask(signerContext, task, key);
  };

  const canHandleTaskInFuture = (task: any) => {
    const canHandle = signerContext.keyPool.isKeyForTaskExist(task);
    if (canHandle) return true;
    throw new Error(`There is no key, which can sigh the task`);
  };

  return {
    handleAddTask,
    handleKeyUnlock,
    canHandleTaskInFuture,
  };
};
