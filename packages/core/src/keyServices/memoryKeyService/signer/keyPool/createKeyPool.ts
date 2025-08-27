import { createFindKeyForTask } from './createFindKeyForTask';
import { createIsKeyForTaskExist } from './createIsKeyForTaskExist';
import { getFullAccessKeyList } from './getFullAccessKeyList';
import { getFunctionCallKeyList } from './getFunctionCallKeyList';
import type { Context as KeyServiceContext } from 'nat-types/keyServices/memoryKeyService';
import type { SignerContext } from 'nat-types/keyServices/signer';

export const createKeyPool = async (
  signerContext: SignerContext,
  keyServiceContext: KeyServiceContext,
) => {
  const { accountKeys } = await signerContext.client.getAccountKeys({
    accountId: signerContext.signerAccountId,
  });

  const keyList = {
    fullAccess: getFullAccessKeyList(accountKeys, keyServiceContext.keyPairs),
    functionCall: getFunctionCallKeyList(
      accountKeys,
      keyServiceContext.keyPairs,
    ),
  };

  return {
    findKeyForTask: createFindKeyForTask(keyList),
    isKeyForTaskExist: createIsKeyForTaskExist(keyList),
  };
};
