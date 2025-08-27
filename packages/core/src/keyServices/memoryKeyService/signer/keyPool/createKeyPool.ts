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

  // If the user want to handle all tasks only by a specific key - remove others
  const filteredKeys = accountKeys.filter((key) =>
    signerContext.signerPublicKey
      ? signerContext.signerPublicKey === key.publicKey
      : true,
  );

  const keyList = {
    fullAccess: getFullAccessKeyList(filteredKeys, keyServiceContext.keyPairs),
    functionCall: getFunctionCallKeyList(
      filteredKeys,
      keyServiceContext.keyPairs,
    ),
  };

  if (keyList.fullAccess.length === 0 && keyList.functionCall.length === 0)
    throw new Error('Cannot create a signer with no account keys');

  return {
    findKeyForTask: createFindKeyForTask(keyList),
    isKeyForTaskExist: createIsKeyForTaskExist(keyList),
  };
};
