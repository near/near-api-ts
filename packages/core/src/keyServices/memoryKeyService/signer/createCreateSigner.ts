import { createKeyPool } from './keyPool/createKeyPool';
import { createTaskQueue } from './taskQueue/createTaskQueue';
import { createMatcher } from './matcher/createMatcher';
import { createResolver } from './resolver/createResolver';
import { createState } from './state/createState';
import { SignerTaskQueueTimeout } from '@common/configs/constants';
import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import type { CreateSigner } from 'nat-types/keyServices/signer';

export const createCreateSigner =
  (keyServiceContext: KeyServiceContext): CreateSigner =>
  async (params) => {
    const context: any = {
      signerAccountId: params.signerAccountId,
      client: params.client,
      signerPublicKey: params?.options?.signerPublicKey, // TODO handle case when only 1 key is allowed
      queueTimeout: params?.options?.queueTimeout ?? SignerTaskQueueTimeout,
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
      executeTransaction: context.taskQueue.executeTransaction,
      signTransaction: context.taskQueue.signTransaction,
    };
  };
