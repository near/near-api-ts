import { signTransaction } from '../executors/signTransaction';
import { executeTransaction } from '../executors/executeTransaction';
import type { Task } from 'nat-types/signers/memorySigner/taskQueue';
import type { KeyPoolKey } from 'nat-types/signers/memorySigner/keyPool';
import type { MemorySignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { CreateMatcher } from 'nat-types/signers/memorySigner/matcher';
import { result } from '@common/utils/result';
import { createNatError } from '@common/natError';

const execute = (task: Task) => {
  if (task.taskType === 'SignTransaction') return signTransaction;
  return executeTransaction;
};

const executeTask = async (
  signerContext: MemorySignerContext,
  task: Task,
  key: KeyPoolKey,
) => {
  key.lock();
  signerContext.taskQueue.removeTask(task.taskId);

  await execute(task)(signerContext, task, key);

  key.unlock();
  void signerContext.matcher.handleKeyUnlock(key);
};

export const createMatcher: CreateMatcher = (signerContext) => {
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
    return canHandle
      ? result.ok(true as const)
      : result.err(
          createNatError({
            kind: 'MemorySigner.Matcher.NoKeysForTaskFound',
            context: { accessTypePriority: task.accessTypePriority },
          }),
        );
  };

  return {
    handleAddTask,
    handleKeyUnlock,
    canHandleTaskInFuture,
  };
};
