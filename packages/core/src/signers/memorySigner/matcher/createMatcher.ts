import { signTransaction } from '../executors/signTransaction';
import { executeTransaction } from '../executors/executeTransaction';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { PoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { CreateMatcher } from 'nat-types/signers/memorySigner/matcher';

const executeTask = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: PoolKey,
) => {
  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  const executeFn =
    task.taskType === 'ExecuteTransaction'
      ? executeTransaction
      : signTransaction;

  await executeFn(signerContext, task, key);

  key.unlock();
  void signerContext.matcher.handleKeyUnlock(key);
};

export const createMatcher: CreateMatcher = (signerContext) => {
  const handleAddTask = async (task: Task) => {
    const key = await signerContext.keyPool.findKeyForTask(task);
    if (!key.ok) throw key; // should never happen, because we check it before adding a task to the queue
    if (key.value) void executeTask(signerContext, task, key.value);
  };

  const handleKeyUnlock = async (key: PoolKey) => {
    const task = signerContext.taskQueue.findTaskForKey(key);
    if (task) void executeTask(signerContext, task, key);
  };

  // const canHandleTaskInFuture = async (task: Task) => {
  //   const canHandle = await signerContext.keyPool.isKeyForTaskExist(task);
  //   return canHandle
  //     ? result.ok(true as const)
  //     : result.err(
  //         createNatError({
  //           kind: 'MemorySigner.Matcher.KeyForTaskNotFound',
  //           context: { accessTypePriority: task.accessTypePriority },
  //         }),
  //       );
  // };

  return {
    handleAddTask,
    handleKeyUnlock,
  };
};
