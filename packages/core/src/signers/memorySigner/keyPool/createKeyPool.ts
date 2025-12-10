import { createFindKeyForTask } from './createFindKeyForTask';
import { createIsKeyForTaskExist } from './createIsKeyForTaskExist';
import { getFullAccessKeyList } from './getFullAccessKeyList';
import { getFunctionCallKeyList } from './getFunctionCallKeyList';
import type { SignerContext } from 'nat-types/signers/memorySigner/memorySigner';
import type { AccountAccessKey } from 'nat-types/_common/accountAccessKey';
import type { KeyPool } from 'nat-types/signers/memorySigner/keyPool';

const getAllowedSigningKeys = (
  signerContext: SignerContext,
  accountKeys: AccountAccessKey[],
) => {
  if (!signerContext.signingKeys) return accountKeys;
  const set = new Set(signerContext.signingKeys);
  return accountKeys.filter((key) => set.has(key.publicKey));
};

export const createKeyPool = async (
  signerContext: SignerContext,
): Promise<KeyPool> => {
  const { accountKeys } = await signerContext.client.getAccountKeys({
    accountId: signerContext.signerAccountId,
  });

  // If the user want to handle all tasks only by a specific key - remove others
  const filteredKeys = getAllowedSigningKeys(signerContext, accountKeys);

  const keyList = {
    fullAccess: getFullAccessKeyList(filteredKeys, signerContext),
    functionCall: getFunctionCallKeyList(filteredKeys, signerContext),
  };

  if (keyList.fullAccess.length === 0 && keyList.functionCall.length === 0)
    throw new Error('Cannot create a signer with no account keys');

  return {
    findKeyForTask: createFindKeyForTask(keyList),
    isKeyForTaskExist: createIsKeyForTaskExist(keyList),
  };
};
