import { signTransactionExecutor } from '../executors/signTransactionExecutor';

const createHandleAddTask = (signerContext: any) => (task: any) => {
  const key = signerContext.keyPool.findKeyForTask(task.keyPriority);
  if (!key) return;

  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  if (task.type === 'SignTransaction')
    signTransactionExecutor(signerContext, task, key);
};

const createHandleKeyUnlock = (signerContext: any) => (key: any) => {
  const task = signerContext.taskQueue.findTaskForKey(key);
  if (!task) return;

  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  if (task.type === 'SignTransaction')
    signTransactionExecutor(signerContext, task, key);
}

export const createMatcher = (signerContext: any) => {
  return {
    handleAddTask: createHandleAddTask(signerContext),
    handleKeyUnlock: createHandleKeyUnlock(signerContext),
  };
};
