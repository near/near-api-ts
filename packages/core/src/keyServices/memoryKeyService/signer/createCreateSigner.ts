import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import { createState } from './state/createState';
import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import type { CreateSigner } from 'nat-types/keyServices/signer';

// TODO Add check if it's not possible to sign the tx at all - throw error immediately, don't wait forever

export const createCreateSigner =
  (keyServiceContext: KeyServiceContext): CreateSigner =>
  async (params) => {
    const context: any = {
      signerAccountId: params.signerAccountId,
      signerPublicKey: params.signerPublicKey, // TODO handle case when only 1 key is allowed
      client: params.client,
    };

    const [keyPool, state] = await Promise.all([
      createKeyPool(context, keyServiceContext),
      createState(context),
    ]);

    context.keyPool = keyPool;
    context.state = state;
    context.taskQueue = createTaskQueue(context);
    context.matcher = createMatcher(context);
    context.resolver = createResolver();

    return {
      executeTransaction: context.taskQueue.addTask.executeTransaction,
      signTransaction: context.taskQueue.addTask.signTransaction,
    };
  };
