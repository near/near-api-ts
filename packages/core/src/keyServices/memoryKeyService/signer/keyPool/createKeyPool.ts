import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import { createFindKeyForTask } from './createFindKeyForTask';
import { getFullAccessKeyList } from './getFullAccessKeyList';
import { getFunctionCallKeyList } from './getFunctionCallKeyList';

export const createKeyPool = async (
  signerContext: any,
  keyServiceContext: KeyServiceContext,
) => {
  const { keys } = await signerContext.client.getAccountKeys({
    accountId: signerContext.signerAccountId,
  });

  const keyList = {
    fullAccess: getFullAccessKeyList(
      keys,
      keyServiceContext.keyPairs,
      signerContext,
    ),
    functionCall: getFunctionCallKeyList(
      keys,
      keyServiceContext.keyPairs,
      signerContext,
    ),
  };

  return {
    findKeyForTask: createFindKeyForTask(keyList),
  };
};
