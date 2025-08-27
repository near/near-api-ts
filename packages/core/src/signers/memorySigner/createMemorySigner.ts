import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import { createState } from './state/createState';
import { SignerTaskTtlMs } from '@common/configs/constants';
import type { CreateMemorySigner } from 'nat-types/signers/memorySigner';

export const createMemorySigner: CreateMemorySigner = async (args) => {
  const context: any = {
    signerAccountId: args.signerAccountId,
    client: args.client,
    keyService: args.keyService,
    signingKeys: args?.keyPool?.signingKeys,
    taskTtlMs: args?.queue?.taskTtlMs ?? SignerTaskTtlMs,
  };

  const [keyPool, state] = await Promise.all([
    createKeyPool(context),
    createState(context),
  ]);

  context.keyPool = keyPool;
  context.state = state;
  context.taskQueue = createTaskQueue(context);
  context.matcher = createMatcher(context);
  context.resolver = createResolver();

  return {
    executeTransaction: context.taskQueue.executeTransaction,
    executeMultipleTransactions: context.taskQueue.executeeMultipleTransactions,
    signTransaction: context.taskQueue.signTransaction,
    signMultipleTransactions: context.taskQueue.signMultipleTransactions,
  };
};
