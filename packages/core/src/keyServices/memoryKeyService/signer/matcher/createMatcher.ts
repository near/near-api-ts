import { signTransaction } from '../executors/signTransaction';

const executeTask = async (signerContext: any, task: any, key: any) => {
  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  if (task.type === 'SignTransaction')
    await signTransaction(signerContext, task, key);

  queueMicrotask(() => {
    key.incrementNonce();
    key.unlock();
  });
};

export const createMatcher = (signerContext: any) => {
  const handleAddTask = async (task: any) => {
    console.log('handleAddTask');
    const key = signerContext.keyPool.findKeyForTask(task.keyPriority);
    if (!key) return;
    await executeTask(signerContext, task, key);
  };

  const handleKeyUnlock = async (key: any) => {
    console.log('handleKeyUnlock');
    const task = signerContext.taskQueue.findTaskForKey(key);
    if (!task) return;
    await executeTask(signerContext, task, key);
  };

  return {
    handleAddTask,
    handleKeyUnlock,
  };
};
