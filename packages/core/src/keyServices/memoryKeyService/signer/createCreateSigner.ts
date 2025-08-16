import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
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
    console.log(taskId);
    return await context.resolver.waitForTask(taskId);
  };

export const createCreateSigner =
  (keyServiceContext: KeyServiceContext): CreateSigner =>
  async (params) => {
    const context: any = {
      signerAccountId: params.signerAccountId,
      signerPublicKey: params.signerPublicKey, // TODO handle case when only 1 key is allowed
      client: params.client,
    };

    context.keyPool = await createKeyPool(context, keyServiceContext);
    context.taskQueue = createTaskQueue(context);
    context.matcher = createMatcher(context);
    context.resolver = createResolver(context);

    return {
      // executeTransaction: createExecuteTransaction(context),
      signTransaction: createSignTransaction(context),
    };
  };
