import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import { createBlockHashManager } from './blockHashManager/createBlockHashManager';
import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import type { CreateSigner } from 'nat-types/keyServices/signer';
import type { TransactionIntent } from 'nat-types/transaction';

// TODO Add check if it's not possible to sign the tx at all - throw error immediately, don't wait forever

const createExecuteTransaction =
  (context: any) =>
  async ({ action, receiverAccountId, options }: any) => {
    console.log('ExecuteTransaction', action);
  };

const createExecuteMultipleTransaction =
  (context: any) =>
  async ({ transactionIntents }: any) => {};

const createSignTransaction =
  (context: any) => async (transactionIntent: TransactionIntent) => {
    const taskId = context.taskQueue.addSignTransactionTask(transactionIntent);
    console.log('SignTX Task created', taskId);
    const res = await context.resolver.waitForTask(taskId);
    console.log('^^^^^^^^^^^');
    console.log('SignTX Result received', res);
    return res;
  };

export const createCreateSigner =
  (keyServiceContext: KeyServiceContext): CreateSigner =>
  async (params) => {
    const context: any = {
      signerAccountId: params.signerAccountId,
      signerPublicKey: params.signerPublicKey, // TODO handle case when only 1 key is allowed
      client: params.client,
    };

    const [keyPool, blockHashManager] = await Promise.all([
      createKeyPool(context, keyServiceContext),
      createBlockHashManager(context),
    ]);

    context.keyPool = keyPool;
    context.blockHashManager = blockHashManager;
    context.taskQueue = createTaskQueue(context);
    context.matcher = createMatcher(context);
    context.resolver = createResolver();

    return {
      // executeTransaction: createExecuteTransaction(context),
      signTransaction: createSignTransaction(context),
    };
  };
